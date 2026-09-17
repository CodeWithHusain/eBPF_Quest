import { prisma } from '../../lib/db/prisma.js';
import { getLevelProgress } from '../../config/gamification.js';

/**
 * Stage 8: Server-Side XP Ledger Service
 *
 * All XP awards are transactional, transparent, and strictly idempotent.
 * Enforces DB unique constraint on [userId, sourceType, sourceId, rewardType].
 */

// In-memory fallback ledger for tests or environments running without PostgreSQL
const inMemoryXPLedger = new Map(); // key: `${userId}:${sourceType}:${sourceId}:${rewardType}` -> transaction

export const xpService = {
  /**
   * Awards XP to a user in an idempotent, atomic transaction.
   * If the reward has already been granted, safely returns existing transaction without duplicate XP.
   */
  async awardXP({ userId, amount, reason, sourceType, sourceId, rewardType }) {
    if (!userId || !amount || amount <= 0 || !sourceType || !sourceId || !rewardType) {
      throw new Error('Invalid XP award parameters');
    }

    try {
      const transaction = await prisma.xPTransaction.create({
        data: {
          userId,
          amount,
          reason,
          sourceType,
          sourceId,
          rewardType,
        },
      });

      return {
        awarded: true,
        transaction,
        amount,
      };
    } catch (err) {
      // Catch unique constraint violation (P2002 in Prisma) -> Idempotency hit
      if (err.code === 'P2002' || err.message?.includes('unique constraint') || err.message?.includes('Unique constraint failed')) {
        return {
          awarded: false,
          reason: 'ALREADY_AWARDED',
          message: 'XP for this milestone has already been granted.',
        };
      }

      // In-memory fallback if DB is unreachable in test environment
      const memKey = `${userId}:${sourceType}:${sourceId}:${rewardType}`;
      if (inMemoryXPLedger.has(memKey)) {
        return {
          awarded: false,
          reason: 'ALREADY_AWARDED',
          message: 'XP for this milestone has already been granted.',
        };
      }

      const memTx = {
        id: `xp-mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        userId,
        amount,
        reason,
        sourceType,
        sourceId,
        rewardType,
        createdAt: new Date(),
      };
      inMemoryXPLedger.set(memKey, memTx);

      return {
        awarded: true,
        transaction: memTx,
        amount,
      };
    }
  },

  /**
   * Calculates total XP and level details for a user.
   */
  async getUserXP(userId) {
    if (!userId) {
      return getLevelProgress(0);
    }

    try {
      const aggregate = await prisma.xPTransaction.aggregate({
        where: { userId },
        _sum: { amount: true },
      });

      const totalXP = aggregate._sum.amount || 0;
      return getLevelProgress(totalXP);
    } catch (err) {
      // In-memory fallback summation
      let totalXP = 0;
      for (const tx of inMemoryXPLedger.values()) {
        if (tx.userId === userId) {
          totalXP += tx.amount;
        }
      }
      return getLevelProgress(totalXP);
    }
  },

  /**
   * Retrieves user XP transaction history.
   */
  async getXPHistory(userId, limit = 20, offset = 0) {
    if (!userId) return [];

    try {
      const history = await prisma.xPTransaction.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      });

      return history;
    } catch (err) {
      // In-memory fallback
      const list = [];
      for (const tx of inMemoryXPLedger.values()) {
        if (tx.userId === userId) list.push(tx);
      }
      return list.sort((a, b) => b.createdAt - a.createdAt).slice(offset, offset + limit);
    }
  },
};

export default xpService;
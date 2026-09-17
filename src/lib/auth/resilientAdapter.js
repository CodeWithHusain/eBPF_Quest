import adapterPkg from '@next-auth/prisma-adapter';
import { prisma } from '../db/prisma.js';
import {
  isDbConnectionError,
  devGetUserById,
  devGetUserByEmail,
  devCreateUser,
  devUpdateUser,
  devGetAccount,
  devLinkAccount,
} from '../db/devStore.js';

const BasePrismaAdapter =
  adapterPkg.PrismaAdapter ||
  adapterPkg.default?.PrismaAdapter ||
  adapterPkg;

/**
 * Resilient NextAuth adapter that delegates to PrismaAdapter when PostgreSQL is online,
 * and seamlessly falls back to devStore when running locally without PostgreSQL.
 */
export function createResilientAdapter() {
  const baseAdapter = BasePrismaAdapter(prisma);

  return {
    async createUser(user) {
      try {
        return await baseAdapter.createUser(user);
      } catch (err) {
        if (isDbConnectionError(err)) {
          console.warn('[resilientAdapter] PostgreSQL offline. Creating OAuth user in devStore.');
          return devCreateUser({
            email: user.email,
            username: user.username || `user_${Date.now().toString().slice(-6)}`,
            name: user.name,
            image: user.image,
            passwordHash: null,
          });
        }
        throw err;
      }
    },

    async getUser(id) {
      try {
        return await baseAdapter.getUser(id);
      } catch (err) {
        if (isDbConnectionError(err)) {
          return devGetUserById(id);
        }
        throw err;
      }
    },

    async getUserByEmail(email) {
      try {
        return await baseAdapter.getUserByEmail(email);
      } catch (err) {
        if (isDbConnectionError(err)) {
          return devGetUserByEmail(email);
        }
        throw err;
      }
    },

    async getUserByAccount({ providerAccountId, provider }) {
      try {
        return await baseAdapter.getUserByAccount({ providerAccountId, provider });
      } catch (err) {
        if (isDbConnectionError(err)) {
          const account = devGetAccount(provider, providerAccountId);
          if (!account) return null;
          return devGetUserById(account.userId);
        }
        throw err;
      }
    },

    async updateUser(user) {
      try {
        return await baseAdapter.updateUser(user);
      } catch (err) {
        if (isDbConnectionError(err)) {
          return devUpdateUser(user.id, user);
        }
        throw err;
      }
    },

    async deleteUser(userId) {
      try {
        return await baseAdapter.deleteUser(userId);
      } catch (err) {
        if (isDbConnectionError(err)) {
          return;
        }
        throw err;
      }
    },

    async linkAccount(account) {
      try {
        return await baseAdapter.linkAccount(account);
      } catch (err) {
        if (isDbConnectionError(err)) {
          console.warn('[resilientAdapter] PostgreSQL offline. Linking OAuth account in devStore.');
          return devLinkAccount(account);
        }
        throw err;
      }
    },

    async unlinkAccount({ providerAccountId, provider }) {
      try {
        return await baseAdapter.unlinkAccount({ providerAccountId, provider });
      } catch (err) {
        if (isDbConnectionError(err)) {
          return;
        }
        throw err;
      }
    },

    async createSession(session) {
      try {
        return await baseAdapter.createSession(session);
      } catch (err) {
        if (isDbConnectionError(err)) {
          return session;
        }
        throw err;
      }
    },

    async getSessionAndUser(sessionToken) {
      try {
        return await baseAdapter.getSessionAndUser(sessionToken);
      } catch (err) {
        if (isDbConnectionError(err)) {
          return null;
        }
        throw err;
      }
    },

    async updateSession(session) {
      try {
        return await baseAdapter.updateSession(session);
      } catch (err) {
        if (isDbConnectionError(err)) {
          return session;
        }
        throw err;
      }
    },

    async deleteSession(sessionToken) {
      try {
        return await baseAdapter.deleteSession(sessionToken);
      } catch (err) {
        if (isDbConnectionError(err)) {
          return;
        }
        throw err;
      }
    },
  };
}

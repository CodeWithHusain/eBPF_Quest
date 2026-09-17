import EventEmitter from 'events';
import { ExecutionJobStatus, ExecutionErrorCode } from './executionTypes.js';
import { ExecutionPolicy } from './executionPolicy.js';

/**
 * Stage 7: Resilient In-Memory Asynchronous Job Queue
 *
 * Implements FIFO job queuing, concurrency caps, rate limiting, and backpressure.
 * Designed with a clean queue abstraction so Redis/BullMQ can be plugged in without
 * changing calling code.
 */
export class JobQueue extends EventEmitter {
  constructor() {
    super();
    this.queue = [];
    this.activeJobs = new Map(); // jobId -> jobData
    this.userActiveCount = new Map(); // userId -> number
    this.userRateTimestamps = new Map(); // userId -> array of submission timestamps
    this.maxConcurrent = ExecutionPolicy.MAX_GLOBAL_CONCURRENT_JOBS;
  }

  /**
   * Evaluates user submission rate limits.
   */
  checkRateLimit(userId) {
    if (!userId) return true;
    const now = Date.now();
    const windowStart = now - ExecutionPolicy.RATE_LIMIT_WINDOW_MS;

    let timestamps = this.userRateTimestamps.get(userId) || [];
    // Filter out old timestamps
    timestamps = timestamps.filter((t) => t > windowStart);
    this.userRateTimestamps.set(userId, timestamps);

    if (timestamps.length >= ExecutionPolicy.MAX_JOBS_PER_WINDOW) {
      return false;
    }
    return true;
  }

  recordSubmission(userId) {
    if (!userId) return;
    const timestamps = this.userRateTimestamps.get(userId) || [];
    timestamps.push(Date.now());
    this.userRateTimestamps.set(userId, timestamps);
  }

  /**
   * Enqueues an execution job.
   */
  enqueue(job) {
    // 1. Check user rate limit
    if (!this.checkRateLimit(job.userId)) {
      throw new Error(ExecutionErrorCode.RATE_LIMITED);
    }

    // 2. Check per-user concurrency limit
    const userActive = this.userActiveCount.get(job.userId) || 0;
    if (userActive >= ExecutionPolicy.MAX_USER_CONCURRENT_JOBS) {
      throw new Error(ExecutionErrorCode.RESOURCE_LIMIT);
    }

    // 3. Check queue backpressure
    if (this.queue.length >= 100) {
      throw new Error(ExecutionErrorCode.QUEUE_FULL);
    }

    this.recordSubmission(job.userId);
    this.queue.push(job);
    this.emit('enqueued', job);
    this.processNext();

    return job;
  }

  /**
   * Dispatches the next queued job if under concurrency limit.
   */
  processNext() {
    if (this.activeJobs.size >= this.maxConcurrent) {
      return; // Global concurrency capacity reached
    }

    if (this.queue.length === 0) {
      return; // Nothing in queue
    }

    const job = this.queue.shift();
    this.activeJobs.set(job.id, job);

    const userCount = (this.userActiveCount.get(job.userId) || 0) + 1;
    this.userActiveCount.set(job.userId, userCount);

    this.emit('process', job);
  }

  /**
   * Marks job finished and releases concurrency slot.
   */
  completeJob(jobId, userId) {
    this.activeJobs.delete(jobId);

    if (userId) {
      const userCount = Math.max(0, (this.userActiveCount.get(userId) || 1) - 1);
      if (userCount === 0) {
        this.userActiveCount.delete(userId);
      } else {
        this.userActiveCount.set(userId, userCount);
      }
    }

    this.processNext();
  }

  getStats() {
    return {
      queued: this.queue.length,
      active: this.activeJobs.size,
      maxConcurrent: this.maxConcurrent,
    };
  }
}

export const defaultJobQueue = new JobQueue();
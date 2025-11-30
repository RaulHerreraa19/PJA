import { Queue, Worker, QueueEvents, Processor, QueueOptions, WorkerOptions, QueueEventsOptions } from 'bullmq';
import Redis, { RedisOptions } from 'ioredis';
import env from './env';

export const redisOptions: RedisOptions = {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  tls: env.REDIS_URL.startsWith('rediss://') ? {} : undefined
};

export const redisConnection = new Redis(env.REDIS_URL, redisOptions);

const baseQueueOptions = {
  connection: redisConnection,
  prefix: env.BULLMQ_PREFIX
};

export const createQueue = <T = unknown>(name: string, options?: Omit<QueueOptions, 'connection'>) =>
  new Queue<T>(name, { ...baseQueueOptions, ...options });

export const createWorker = <T = unknown>(name: string, processor: Processor<T>, options?: WorkerOptions) =>
  new Worker<T>(name, processor, { ...baseQueueOptions, ...options });

export const createQueueEvents = (name: string, options?: QueueEventsOptions) =>
  new QueueEvents(name, { ...baseQueueOptions, ...options });

import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class SlotLockService implements OnModuleDestroy {
  private readonly logger = new Logger(SlotLockService.name);
  private readonly redis: Redis;
  private readonly LOCK_TTL = 120; // 2 minutes in seconds

  constructor(private readonly configService: ConfigService) {
    this.redis = new Redis({
      host: configService.get('REDIS_HOST', 'localhost'),
      port: configService.get('REDIS_PORT', 6379),
      retryStrategy: (times) => {
        if (times > 3) {
          this.logger.error('Redis connection failed after 3 retries');
          return null;
        }
        return Math.min(times * 100, 3000);
      },
    });

    this.redis.on('error', (err) => {
      this.logger.error(`Redis error: ${err.message}`);
    });

    this.redis.on('connect', () => {
      this.logger.log('Redis connected successfully');
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  /**
   * Generate a unique slot key for appointment locking
   */
  private getSlotKey(doctorId: string, dateTime: Date): string {
    const dateStr = dateTime.toISOString().split('T')[0]; // YYYY-MM-DD
    const timeStr = dateTime.toTimeString().split(' ')[0].substring(0, 5); // HH:MM
    return `slot_lock:${doctorId}:${dateStr}:${timeStr}`;
  }

  /**
   * Attempt to acquire a lock on a specific time slot
   * @returns true if lock acquired, false if slot is already locked
   */
  async acquireLock(doctorId: string, dateTime: Date, userId: string): Promise<boolean> {
    const key = this.getSlotKey(doctorId, dateTime);
    const lockValue = JSON.stringify({
      userId,
      lockedAt: new Date().toISOString(),
    });

    // Use SET NX EX (set if not exists with expiry)
    const result = await this.redis.set(key, lockValue, 'EX', this.LOCK_TTL, 'NX');

    if (result === 'OK') {
      this.logger.debug(`Lock acquired for slot ${key} by user ${userId}`);
      return true;
    }

    // Check if the existing lock belongs to the same user
    const existingLock = await this.redis.get(key);
    if (existingLock) {
      const lockData = JSON.parse(existingLock);
      if (lockData.userId === userId) {
        // Extend the lock for the same user
        await this.redis.expire(key, this.LOCK_TTL);
        return true;
      }
    }

    this.logger.debug(`Lock failed for slot ${key} - already locked`);
    return false;
  }

  /**
   * Release a lock on a specific time slot
   */
  async releaseLock(doctorId: string, dateTime: Date, userId: string): Promise<boolean> {
    const key = this.getSlotKey(doctorId, dateTime);

    // Only release if the lock belongs to this user
    const existingLock = await this.redis.get(key);
    if (!existingLock) {
      return true; // No lock exists
    }

    const lockData = JSON.parse(existingLock);
    if (lockData.userId !== userId) {
      this.logger.warn(`Cannot release lock for slot ${key} - belongs to different user`);
      return false;
    }

    await this.redis.del(key);
    this.logger.debug(`Lock released for slot ${key}`);
    return true;
  }

  /**
   * Check if a slot is currently locked
   */
  async isLocked(doctorId: string, dateTime: Date): Promise<boolean> {
    const key = this.getSlotKey(doctorId, dateTime);
    const exists = await this.redis.exists(key);
    return exists === 1;
  }

  /**
   * Get lock information for a slot
   */
  async getLockInfo(
    doctorId: string,
    dateTime: Date,
  ): Promise<{
    isLocked: boolean;
    lockedBy?: string;
    lockedAt?: string;
    expiresIn?: number;
  }> {
    const key = this.getSlotKey(doctorId, dateTime);
    const lockValue = await this.redis.get(key);
    const ttl = await this.redis.ttl(key);

    if (!lockValue) {
      return { isLocked: false };
    }

    const lockData = JSON.parse(lockValue);
    return {
      isLocked: true,
      lockedBy: lockData.userId,
      lockedAt: lockData.lockedAt,
      expiresIn: ttl > 0 ? ttl : undefined,
    };
  }

  /**
   * Get all locked slots for a doctor on a specific date
   */
  async getLockedSlots(doctorId: string, date: Date): Promise<string[]> {
    const dateStr = date.toISOString().split('T')[0];
    const pattern = `slot_lock:${doctorId}:${dateStr}:*`;

    const keys = await this.redis.keys(pattern);
    return keys.map((key) => {
      const timePart = key.split(':')[3];
      return timePart;
    });
  }

  /**
   * Extend the lock TTL (refresh)
   */
  async extendLock(doctorId: string, dateTime: Date, userId: string): Promise<boolean> {
    const key = this.getSlotKey(doctorId, dateTime);

    const existingLock = await this.redis.get(key);
    if (!existingLock) {
      return false;
    }

    const lockData = JSON.parse(existingLock);
    if (lockData.userId !== userId) {
      return false;
    }

    await this.redis.expire(key, this.LOCK_TTL);
    return true;
  }
}

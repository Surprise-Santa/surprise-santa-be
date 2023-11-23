import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T = any>(key: string): Promise<T> {
    return this.cache.get(key);
  }

  async set(key: string, value: any, ttl?: number): Promise<any> {
    return this.cache.set(key, value, ttl ? ttl : 3600);
  }

  async remove(key: string): Promise<any | any[]> {
    return this.cache.del(key);
  }

  async reset(): Promise<void> {
    return this.cache.reset();
  }
}

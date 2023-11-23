import { Injectable } from '@nestjs/common';
import { CacheService } from '../cache/cache.service';
import { AppUtilities } from '../utilities';

@Injectable()
export class TokenService {
  constructor(private cacheService: CacheService) {}

  async createToken(type: string, userEmail: string, ttl?: number) {
    const token = AppUtilities.generateShortCode(14);

    const userData = {
      id: userEmail,
      token,
      type,
    };

    await this.cacheService.set(type, JSON.stringify(userData), ttl);

    return token;
  }

  async verifyToken(key: string, userToken: string) {
    const existingToken = await this.cacheService.get(key);

    if (!existingToken) return { isValid: false };

    const { id, type, token } = JSON.parse(existingToken);

    if (type === key && token === userToken) {
      await this.cacheService.remove(key);
      return { isValid: true, id };
    }
    return { isValid: false };
  }
}

import { describe, it, expect, beforeEach } from 'vitest';
import {
  signJWT,
  verifyJWT,
  signRefreshToken,
  verifyRefreshToken,
  isRefreshTokenExpiringSoon,
} from '../lib/jwt';

const TEST_SECRET = 'test-secret-key-for-jwt-signing-32chars';

describe('JWT Module', () => {
  describe('signJWT', () => {
    it('should create a valid JWT token', async () => {
      const token = await signJWT(
        { sub: 'user-123', email: 'test@example.com' },
        TEST_SECRET
      );

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should create tokens with custom expiration', async () => {
      const token = await signJWT(
        { sub: 'user-123', email: 'test@example.com' },
        TEST_SECRET,
        '1h'
      );

      expect(token).toBeDefined();
    });
  });

  describe('verifyJWT', () => {
    it('should verify a valid JWT and return payload', async () => {
      const token = await signJWT(
        { sub: 'user-123', email: 'test@example.com' },
        TEST_SECRET
      );

      const payload = await verifyJWT(token, TEST_SECRET);

      expect(payload.sub).toBe('user-123');
      expect(payload.email).toBe('test@example.com');
    });

    it('should reject invalid tokens', async () => {
      await expect(verifyJWT('invalid-token', TEST_SECRET)).rejects.toThrow();
    });

    it('should reject tokens with wrong secret', async () => {
      const token = await signJWT(
        { sub: 'user-123', email: 'test@example.com' },
        TEST_SECRET
      );

      await expect(verifyJWT(token, 'wrong-secret')).rejects.toThrow();
    });

    it('should reject expired tokens', async () => {
      const token = await signJWT(
        { sub: 'user-123', email: 'test@example.com' },
        TEST_SECRET,
        '0s'
      );

      await new Promise((resolve) => setTimeout(resolve, 100));

      await expect(verifyJWT(token, TEST_SECRET)).rejects.toThrow();
    });
  });

  describe('signRefreshToken', () => {
    it('should create a valid refresh token', async () => {
      const token = await signRefreshToken('user-123', TEST_SECRET);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
    });
  });

  describe('verifyRefreshToken', () => {
    it('should verify a valid refresh token', async () => {
      const token = await signRefreshToken('user-123', TEST_SECRET);

      const payload = await verifyRefreshToken(token, TEST_SECRET);

      expect(payload.sub).toBe('user-123');
      expect(payload.type).toBe('refresh');
    });

    it('should reject non-refresh tokens', async () => {
      const accessToken = await signJWT(
        { sub: 'user-123', email: 'test@example.com' },
        TEST_SECRET
      );

      await expect(verifyRefreshToken(accessToken, TEST_SECRET)).rejects.toThrow(
        'Invalid refresh token'
      );
    });

    it('should reject tampered tokens', async () => {
      const token = await signRefreshToken('user-123', TEST_SECRET);
      const tamperedToken = token.slice(0, -5) + 'xxxxx';

      await expect(verifyRefreshToken(tamperedToken, TEST_SECRET)).rejects.toThrow();
    });
  });

  describe('isRefreshTokenExpiringSoon', () => {
    it('should return true when token expires in less than 1 day', () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        sub: 'user-123',
        type: 'refresh' as const,
        exp: now + 12 * 60 * 60,
      };

      expect(isRefreshTokenExpiringSoon(payload)).toBe(true);
    });

    it('should return false when token has more than 1 day left', () => {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        sub: 'user-123',
        type: 'refresh' as const,
        exp: now + 2 * 24 * 60 * 60,
      };

      expect(isRefreshTokenExpiringSoon(payload)).toBe(false);
    });

    it('should return true when exp is missing', () => {
      const payload = {
        sub: 'user-123',
        type: 'refresh' as const,
      };

      expect(isRefreshTokenExpiringSoon(payload)).toBe(true);
    });
  });

  describe('Token Round-Trip', () => {
    it('should maintain data integrity through sign/verify cycle', async () => {
      const originalData = {
        sub: 'user-abc-123',
        email: 'roundtrip@test.com',
      };

      const token = await signJWT(originalData, TEST_SECRET);
      const decoded = await verifyJWT(token, TEST_SECRET);

      expect(decoded.sub).toBe(originalData.sub);
      expect(decoded.email).toBe(originalData.email);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it('should handle special characters in email', async () => {
      const data = {
        sub: 'user-123',
        email: 'test+special@example.com',
      };

      const token = await signJWT(data, TEST_SECRET);
      const decoded = await verifyJWT(token, TEST_SECRET);

      expect(decoded.email).toBe(data.email);
    });
  });
});

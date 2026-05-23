import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { envConfig as config } from '@/config';
import { StaffRole, RolePermissions } from '@/types/role.types';

export interface JWTPayload {
  id: string;
  email: string;
  role: StaffRole;
  roleId?: string;
  restaurantId?: string;
  permissions: RolePermissions;
}

export class JWTUtil {
  static generateToken(payload: JWTPayload): string {
    const secret: Secret = config.jwt.secret;

    const options: SignOptions = {
      expiresIn: config.jwt.expiresIn as StringValue,
    };

    return jwt.sign(payload, secret, options);
  }

  static verifyToken(token: string): JWTPayload {
    try {
      return jwt.verify(token, config.jwt.secret as Secret) as JWTPayload;
    } catch (error: any) {
      console.error('[JWTUtil] Verification failed:', error.message);
      throw new Error('Invalid or expired token');
    }
  }
}

import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { envConfig as config } from '@/config';
import { StaffType, IPermissions } from '@/models/StaffTypePermissions.model';
import { StaffRole, RolePermissions } from '@/types/role.types';

export interface JWTPayload {
  id: string;
  email: string;
  staffType?: StaffType;
  role?: StaffRole;
  roleId?: string;
  restaurantId?: string;
  branchId?: string;
  allowedBranchIds?: string[];
  permissions: IPermissions | RolePermissions;
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
    } catch {
      throw new Error('Invalid or expired token');
    }
  }
}

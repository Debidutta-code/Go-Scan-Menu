import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';
import { envConfig as config } from '@/config';
import { IStaff } from '@/models';

export interface JWTPayload {
  id: string;
  email: string;
  role:
    | 'super_admin'
    | 'owner'
    | 'branch_manager'
    | 'manager'
    | 'waiter'
    | 'kitchen_staff'
    | 'cashier';
  restaurantId?: string;
  branchId?: string;
  accessLevel?: 'single_branch' | 'all_branches';
  allowedBranchIds?: string[];
  permissions: IStaff['permissions'];
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

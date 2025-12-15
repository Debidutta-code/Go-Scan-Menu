// FILE 11: src/middlewares/superadmin.auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JWTUtil } from '@/utils';
import { ResponseUtil } from '../utils/response.util';

export class SuperAdminAuthMiddleware {
  static authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return ResponseUtil.error(res, 'No token provided. Access denied.', 401);
      }

      const token = authHeader.substring(7);
      const decoded = JWTUtil.verifyToken(token);

      if (decoded.role !== 'super_admin') {
        return ResponseUtil.error(res, 'Access denied. Super admin privileges required.', 403);
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      next();
    } catch (error: any) {
      return ResponseUtil.error(res, 'Authentication failed', 401);
    }
  };
}
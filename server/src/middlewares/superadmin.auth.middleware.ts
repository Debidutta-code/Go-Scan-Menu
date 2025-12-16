// FILE: src/middlewares/superadmin.auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { JWTUtil, sendResponse } from '@/utils';

export class SuperAdminAuthMiddleware {
  static authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendResponse(res, 401, {
          message: 'No token provided. Access denied.'
        });
      }

      const token = authHeader.substring(7);
      const decoded = JWTUtil.verifyToken(token);

      if (decoded.role !== 'super_admin') {
        return sendResponse(res, 403, {
          message: 'Access denied. Super admin privileges required.'
        });
      }

      (req as any).user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role
      };

      next();
    } catch (error: any) {
      return sendResponse(res, 401, {
        message: 'Authentication failed'
      });
    }
  };
}
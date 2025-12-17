import { Request, Response, NextFunction } from 'express';
import { JWTUtil, sendResponse } from '@/utils';

export class AuthMiddleware {
  static authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return sendResponse(res, 401, {
          message: 'No token provided',
        });
      }

      const token = authHeader.split(' ')[1];
      const decoded = JWTUtil.verifyToken(token);

      if (!decoded?.id || !decoded?.role) {
        return sendResponse(res, 401, {
          message: 'Invalid token',
        });
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        restaurantId: decoded.restaurantId,
        branchId: decoded.branchId,
        accessLevel: decoded.accessLevel,
        allowedBranchIds: decoded.allowedBranchIds,
      };

      next();
    } catch {
      return sendResponse(res, 401, {
        message: 'Authentication failed',
      });
    }
  };

  static authorizeRoles = (...roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return sendResponse(res, 403, {
          message: 'Access denied',
        });
      }
      next();
    };
  };

  static authorizePermission = (permission: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return sendResponse(res, 401, { message: 'Unauthorized' });
      }

      // 🔥 SUPERADMIN BYPASS
      if (req.user.role === 'super_admin') {
        return next();
      }

      const permissions = (req.user as any).permissions;

      if (!permissions || permissions[permission] !== true) {
        return sendResponse(res, 403, {
          message: 'Permission denied',
        });
      }

      next();
    };
  };
}

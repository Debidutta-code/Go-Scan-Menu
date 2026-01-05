import { Request, Response, NextFunction } from 'express';
import { JWTUtil, sendResponse } from '@/utils';
import { RoleRepository } from '@/repositories/role.repository';
import { StaffRole } from '@/types/role.types';

const roleRepo = new RoleRepository();

export class AuthMiddleware {
  static authenticate = async (req: Request, res: Response, next: NextFunction) => {
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

      // Fetch latest role details for real-time permission checking
      let rolePermissions = decoded.permissions;
      if (decoded.roleId) {
        const role = await roleRepo.findById(decoded.roleId);
        if (role && role.isActive) {
          rolePermissions = role.permissions;
        }
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        roleId: decoded.roleId,
        restaurantId: decoded.restaurantId,
        branchId: decoded.branchId,
        accessLevel: decoded.accessLevel,
        allowedBranchIds: decoded.allowedBranchIds,
        permissions: rolePermissions,
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
          message: 'Access denied - Insufficient role',
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

      // SUPERADMIN BYPASS
      if (req.user.role === StaffRole.SUPER_ADMIN) {
        return next();
      }

      // Check if user has permissions object
      const permissions = (req.user as any).permissions;

      if (!permissions || permissions[permission] !== true) {
        return sendResponse(res, 403, {
          message: `Permission denied - ${permission} required`,
        });
      }

      next();
    };
  };

  // New method: Check multiple permissions (user needs ALL of them)
  static authorizeAllPermissions = (...requiredPermissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return sendResponse(res, 401, { message: 'Unauthorized' });
      }

      if (req.user.role === StaffRole.SUPER_ADMIN) {
        return next();
      }

      const permissions = (req.user as any).permissions;

      if (!permissions) {
        return sendResponse(res, 403, {
          message: 'Permission denied - No permissions found',
        });
      }

      // Check if user has all required permissions
      const hasAllPermissions = requiredPermissions.every(
        (perm) => permissions[perm] === true
      );

      if (!hasAllPermissions) {
        return sendResponse(res, 403, {
          message: `Permission denied - Required: ${requiredPermissions.join(', ')}`,
        });
      }

      next();
    };
  };

  // New method: Check any permission (user needs AT LEAST ONE)
  static authorizeAnyPermission = (...requiredPermissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return sendResponse(res, 401, { message: 'Unauthorized' });
      }

      if (req.user.role === StaffRole.SUPER_ADMIN) {
        return next();
      }

      const permissions = (req.user as any).permissions;

      if (!permissions) {
        return sendResponse(res, 403, {
          message: 'Permission denied - No permissions found',
        });
      }

      // Check if user has at least one of the required permissions
      const hasAnyPermission = requiredPermissions.some(
        (perm) => permissions[perm] === true
      );

      if (!hasAnyPermission) {
        return sendResponse(res, 403, {
          message: `Permission denied - Required one of: ${requiredPermissions.join(', ')}`,
        });
      }

      next();
    };
  };

}

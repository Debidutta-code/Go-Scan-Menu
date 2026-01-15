// Enhanced Authentication Middleware - Staff Type Based
import { Request, Response, NextFunction } from 'express';
import { JWTUtil, sendResponse } from '@/utils';
import { StaffTypePermissionsRepository } from '@/repositories/staffTypePermissions.repository';
import { StaffType } from '@/models/StaffTypePermissions.model';
import { StaffRole } from '@/types/role.types';

const permissionsRepo = new StaffTypePermissionsRepository();

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

      // Support both staffType and role for backward compatibility
      const userStaffType = decoded.staffType || (decoded.role as unknown as StaffType);

      if (!decoded?.id || (!decoded?.staffType && !decoded?.role)) {
        return sendResponse(res, 401, {
          message: 'Invalid token',
        });
      }

      // Fetch latest permissions for real-time permission checking
      let permissions = decoded.permissions;
      if (userStaffType !== StaffType.SUPER_ADMIN && decoded.restaurantId) {
        const staffTypePermissions = await permissionsRepo.findByRestaurantAndStaffType(
          decoded.restaurantId,
          userStaffType
        );
        if (staffTypePermissions && staffTypePermissions.isActive) {
          permissions = staffTypePermissions.permissions;
        }
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        staffType: userStaffType,
        restaurantId: decoded.restaurantId,
        branchId: decoded.branchId,
        allowedBranchIds: decoded.allowedBranchIds,
        permissions: permissions,
      };

      next();
    } catch {
      return sendResponse(res, 401, {
        message: 'Authentication failed',
      });
    }
  };

  static authorizeStaffTypes = (...staffTypes: StaffType[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user || !staffTypes.includes(req.user.staffType as StaffType)) {
        return sendResponse(res, 403, {
          message: 'Access denied - Insufficient staff type',
        });
      }
      next();
    };
  };

  // Alias method for role-based authorization (accepts StaffRole enum or string values)
  static authorizeRoles = (...roles: (StaffRole | string)[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return sendResponse(res, 403, {
          message: 'Access denied - Authentication required',
        });
      }

      // Convert user's staffType to string for comparison
      const userRole = req.user.staffType as string;

      // Check if user's role matches any of the allowed roles
      const hasAccess = roles.some(role => {
        const roleStr = typeof role === 'string' ? role : String(role);
        return userRole === roleStr;
      });

      if (!hasAccess) {
        return sendResponse(res, 403, {
          message: 'Access denied - Insufficient role',
        });
      }

      next();
    };
  };

  // Enhanced permission check - supports nested permissions
  static authorizePermission = (module: string, action: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return sendResponse(res, 401, { message: 'Unauthorized' });
      }

      // SUPERADMIN BYPASS
      if (req.user.staffType === StaffType.SUPER_ADMIN) {
        return next();
      }

      // Check nested permissions (e.g., orders.view, menu.create)
      const permissions = (req.user as any).permissions;

      if (!permissions || !permissions[module] || permissions[module][action] !== true) {
        return sendResponse(res, 403, {
          message: `Permission denied - ${module}.${action} required`,
        });
      }

      next();
    };
  };

  // Check multiple permissions (user needs ALL of them)
  static authorizeAllPermissions = (...requiredPermissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return sendResponse(res, 401, { message: 'Unauthorized' });
      }

      if (req.user.staffType === StaffType.SUPER_ADMIN) {
        return next();
      }

      const permissions = (req.user as any).permissions;

      if (!permissions) {
        return sendResponse(res, 403, {
          message: 'Permission denied - No permissions found',
        });
      }

      // Parse and check all required permissions (format: \"module.action\")
      const hasAllPermissions = requiredPermissions.every((perm) => {
        const [module, action] = perm.split('.');
        return permissions[module] && permissions[module][action] === true;
      });

      if (!hasAllPermissions) {
        return sendResponse(res, 403, {
          message: `Permission denied - Required: ${requiredPermissions.join(', ')}`,
        });
      }

      next();
    };
  };

  // Check any permission (user needs AT LEAST ONE)
  static authorizeAnyPermission = (...requiredPermissions: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
      if (!req.user) {
        return sendResponse(res, 401, { message: 'Unauthorized' });
      }

      if (req.user.staffType === StaffType.SUPER_ADMIN) {
        return next();
      }

      const permissions = (req.user as any).permissions;

      if (!permissions) {
        return sendResponse(res, 403, {
          message: 'Permission denied - No permissions found',
        });
      }

      // Parse and check if user has at least one permission
      const hasAnyPermission = requiredPermissions.some((perm) => {
        const [module, action] = perm.split('.');
        return permissions[module] && permissions[module][action] === true;
      });

      if (!hasAnyPermission) {
        return sendResponse(res, 403, {
          message: `Permission denied - Required one of: ${requiredPermissions.join(', ')}`,
        });
      }

      next();
    };
  };

  // Authenticate with token from query parameter (for image/file endpoints)
  static authenticateWithQueryToken = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Try to get token from query parameter first
      let token = req.query.token as string;

      // Fall back to Authorization header if no query token
      if (!token) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
          token = authHeader.split(' ')[1];
        }
      }

      if (!token) {
        return sendResponse(res, 401, {
          message: 'No token provided',
        });
      }

      const decoded = JWTUtil.verifyToken(token);

      // Support both staffType and role for backward compatibility
      const userStaffType = decoded.staffType || (decoded.role as unknown as StaffType);

      if (!decoded?.id || (!decoded?.staffType && !decoded?.role)) {
        return sendResponse(res, 401, {
          message: 'Invalid token',
        });
      }

      // Fetch latest permissions for real-time permission checking
      let permissions = decoded.permissions;
      if (userStaffType !== StaffType.SUPER_ADMIN && decoded.restaurantId) {
        const staffTypePermissions = await permissionsRepo.findByRestaurantAndStaffType(
          decoded.restaurantId,
          userStaffType
        );
        if (staffTypePermissions && staffTypePermissions.isActive) {
          permissions = staffTypePermissions.permissions;
        }
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        staffType: userStaffType,
        restaurantId: decoded.restaurantId,
        branchId: decoded.branchId,
        allowedBranchIds: decoded.allowedBranchIds,
        permissions: permissions,
      };

      next();
    } catch {
      return sendResponse(res, 401, {
        message: 'Authentication failed',
      });
    }
  };
}
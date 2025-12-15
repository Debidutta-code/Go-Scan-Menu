// FILE 10: src/controllers/superadmin.auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import { SuperAdminAuthService } from '../services/superadmin.auth.service';
import { ResponseUtil } from '../utils/response.util';

export class SuperAdminAuthController {
  private service: SuperAdminAuthService;

  constructor() {
    this.service = new SuperAdminAuthService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password } = req.body;

      if (!name || !email || !password) {
        return ResponseUtil.error(res, 'Please provide name, email, and password', 400);
      }

      if (password.length < 6) {
        return ResponseUtil.error(res, 'Password must be at least 6 characters long', 400);
      }

      const result = await this.service.register({ name, email, password });

      return ResponseUtil.success(res, 'Super admin registered successfully', result, 201);
    } catch (error: any) {
      if (error.message === 'Super admin with this email already exists') {
        return ResponseUtil.error(res, error.message, 400);
      }
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return ResponseUtil.error(res, 'Please provide email and password', 400);
      }

      const result = await this.service.login({ email, password });

      return ResponseUtil.success(res, 'Login successful', result);
    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        return ResponseUtil.error(res, error.message, 401);
      }
      next(error);
    }
  };

  getProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 401);
      }

      const superAdmin = await this.service.getProfile(userId);

      return ResponseUtil.success(res, 'Profile fetched successfully', superAdmin);
    } catch (error: any) {
      if (error.message === 'Super admin not found') {
        return ResponseUtil.error(res, error.message, 404);
      }
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const { name, email } = req.body;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 401);
      }

      const superAdmin = await this.service.updateProfile(userId, { name, email });

      return ResponseUtil.success(res, 'Profile updated successfully', superAdmin);
    } catch (error: any) {
      if (error.message === 'Email already in use') {
        return ResponseUtil.error(res, error.message, 400);
      }
      if (error.message === 'Super admin not found') {
        return ResponseUtil.error(res, error.message, 404);
      }
      next(error);
    }
  };

  changePassword = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = (req as any).user?.id;
      const { currentPassword, newPassword } = req.body;

      if (!userId) {
        return ResponseUtil.error(res, 'Unauthorized', 401);
      }

      if (!currentPassword || !newPassword) {
        return ResponseUtil.error(res, 'Please provide current and new password', 400);
      }

      if (newPassword.length < 6) {
        return ResponseUtil.error(res, 'New password must be at least 6 characters long', 400);
      }

      const result = await this.service.changePassword(userId, {
        currentPassword,
        newPassword
      });

      return ResponseUtil.success(res, result.message);
    } catch (error: any) {
      if (error.message === 'Current password is incorrect') {
        return ResponseUtil.error(res, error.message, 401);
      }
      if (error.message === 'Super admin not found') {
        return ResponseUtil.error(res, error.message, 404);
      }
      next(error);
    }
  };
}
// server/src/modules/auth/auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import * as authService from './auth.service';
import { catchAsync, sendResponse } from '@/utils';

export class AuthController {
  register = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      sendResponse(res, 400, {
        message: 'Please provide name, email, and password',
      });
      return;
    }

    if (password.length < 6) {
      sendResponse(res, 400, {
        message: 'Password must be at least 6 characters long',
      });
      return;
    }

    const result = await authService.registerSuperAdmin({ name, email, password });

    sendResponse(res, 201, {
      message: 'Super admin registered successfully',
      data: result,
    });
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      sendResponse(res, 400, {
        message: 'Please provide email and password',
      });
      return;
    }

    const result = await authService.loginSuperAdmin({ email, password });

    sendResponse(res, 200, {
      message: 'Login successful',
      data: result,
    });
  });

  getProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;

    if (!userId) {
      sendResponse(res, 401, { message: 'Unauthorized' });
      return;
    }

    const superAdmin = await authService.getSuperAdminProfile(userId);

    sendResponse(res, 200, {
      message: 'Profile fetched successfully',
      data: superAdmin,
    });
  });

  updateProfile = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { name, email } = req.body;

    if (!userId) {
      sendResponse(res, 401, { message: 'Unauthorized' });
      return;
    }

    const superAdmin = await authService.updateSuperAdminProfile(userId, { name, email });

    sendResponse(res, 200, {
      message: 'Profile updated successfully',
      data: superAdmin,
    });
  });

  changePassword = catchAsync(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      sendResponse(res, 401, { message: 'Unauthorized' });
      return;
    }

    if (!currentPassword || !newPassword) {
      sendResponse(res, 400, {
        message: 'Please provide current and new password',
      });
      return;
    }

    if (newPassword.length < 6) {
      sendResponse(res, 400, {
        message: 'New password must be at least 6 characters long',
      });
      return;
    }

    const result = await authService.changeSuperAdminPassword(userId, {
      currentPassword,
      newPassword,
    });

    sendResponse(res, 200, {
      message: result.message,
    });
  });
}

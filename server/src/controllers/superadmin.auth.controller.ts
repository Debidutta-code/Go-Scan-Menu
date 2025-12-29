// FILE 3: src/controllers/superadmin.auth.controller.ts
import { Request, Response, NextFunction } from 'express';
import {
  registerSuperAdmin,
  loginSuperAdmin,
  getSuperAdminProfile,
  updateSuperAdminProfile,
  changeSuperAdminPassword,
} from '@/services/superadmin.auth.service';
import { sendResponse } from '@/utils';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendResponse(res, 400, {
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return sendResponse(res, 400, {
        message: 'Password must be at least 6 characters long',
      });
    }

    const result = await registerSuperAdmin({ name, email, password });

    return sendResponse(res, 201, {
      message: 'Super admin registered successfully',
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'Super admin with this email already exists') {
      return sendResponse(res, 400, { message: error.message });
    }
    next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendResponse(res, 400, {
        message: 'Please provide email and password',
      });
    }

    const result = await loginSuperAdmin({ email, password });

    return sendResponse(res, 200, {
      message: 'Login successful',
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'Invalid email or password') {
      return sendResponse(res, 401, { message: error.message });
    }
    next(error);
  }
};

export const getProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return sendResponse(res, 401, { message: 'Unauthorized' });
    }

    const superAdmin = await getSuperAdminProfile(userId);

    return sendResponse(res, 200, {
      message: 'Profile fetched successfully',
      data: superAdmin,
    });
  } catch (error: any) {
    if (error.message === 'Super admin not found') {
      return sendResponse(res, 404, { message: error.message });
    }
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { name, email } = req.body;

    if (!userId) {
      return sendResponse(res, 401, { message: 'Unauthorized' });
    }

    const superAdmin = await updateSuperAdminProfile(userId, { name, email });

    return sendResponse(res, 200, {
      message: 'Profile updated successfully',
      data: superAdmin,
    });
  } catch (error: any) {
    if (error.message === 'Email already in use') {
      return sendResponse(res, 400, { message: error.message });
    }
    if (error.message === 'Super admin not found') {
      return sendResponse(res, 404, { message: error.message });
    }
    next(error);
  }
};

export const changePassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return sendResponse(res, 401, { message: 'Unauthorized' });
    }

    if (!currentPassword || !newPassword) {
      return sendResponse(res, 400, {
        message: 'Please provide current and new password',
      });
    }

    if (newPassword.length < 6) {
      return sendResponse(res, 400, {
        message: 'New password must be at least 6 characters long',
      });
    }

    const result = await changeSuperAdminPassword(userId, {
      currentPassword,
      newPassword,
    });

    return sendResponse(res, 200, {
      message: result.message,
    });
  } catch (error: any) {
    if (error.message === 'Current password is incorrect') {
      return sendResponse(res, 401, { message: error.message });
    }
    if (error.message === 'Super admin not found') {
      return sendResponse(res, 404, { message: error.message });
    }
    next(error);
  }
};

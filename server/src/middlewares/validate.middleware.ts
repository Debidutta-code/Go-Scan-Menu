import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { sendResponse } from '@/utils';

export const validateRequest = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = ((error as any).errors || []).map((e: any) => ({
          field: e.path.join('.').replace(/^body\./, '').replace(/^query\./, '').replace(/^params\./, ''),
          message: e.message,
        }));
        return sendResponse(res, 400, {
          message: 'Validation failed',
          errors,
        } as any);
      }
      return next(error);
    }
  };
};

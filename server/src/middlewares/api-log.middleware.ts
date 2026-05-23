import { Request, Response, NextFunction } from 'express';

export const apiLogMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  next();
};

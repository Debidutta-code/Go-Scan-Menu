import { Request, Response } from 'express';
import { ApiLog } from './models/api-log.model';
import { sendResponse } from '@/utils';

export class ApiLogController {
  getLogs = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const skip = (page - 1) * limit;

      const { method, statusCode, search } = req.query;

      const query: any = {};
      if (method) query.method = method;
      if (statusCode) query.statusCode = parseInt(statusCode as string);
      if (search) {
        query.url = { $regex: search, $options: 'i' };
      }

      const logs = await ApiLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit);

      const total = await ApiLog.countDocuments(query);

      return sendResponse(res, 200, {
        message: 'Logs fetched successfully',
        data: {
          logs,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit)
          }
        }
      });
    } catch (error: any) {
      return sendResponse(res, 500, { message: error.message });
    }
  };
}

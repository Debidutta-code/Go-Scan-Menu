import { Request, Response, NextFunction } from 'express';
import { ApiLog } from '@/modules/analytics/models/api-log.model';

const sensitiveFields = ['password', 'token', 'accessToken', 'refreshToken', 'oldPassword', 'newPassword'];

const maskSensitiveData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  const maskedData = { ...data };
  for (const key of Object.keys(maskedData)) {
    if (sensitiveFields.includes(key)) {
      maskedData[key] = '********';
    } else if (typeof maskedData[key] === 'object') {
      maskedData[key] = maskSensitiveData(maskedData[key]);
    }
  }
  return maskedData;
};

export const apiLogMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  // Capture the original send method to intercept response body
  const originalSend = res.send;
  let responseBody: any;

  res.send = function(body: any): Response {
    responseBody = body;
    return originalSend.call(this, body);
  };

  res.on('finish', async () => {
    const duration = Date.now() - start;

    // Don't log the logs endpoint itself to avoid infinite loops/bloat
    if (req.originalUrl.includes('/superadmin/logs')) {
      return;
    }

    try {
      let parsedResBody = responseBody;
      if (typeof responseBody === 'string') {
        try {
          parsedResBody = JSON.parse(responseBody);
        } catch (e) {
          // Keep as string if not JSON
        }
      }

      await ApiLog.create({
        method: req.method,
        url: req.originalUrl,
        headers: maskSensitiveData(req.headers),
        query: maskSensitiveData(req.query),
        body: maskSensitiveData(req.body),
        ip: req.ip || req.socket.remoteAddress,
        statusCode: res.statusCode,
        responseBody: maskSensitiveData(parsedResBody),
        duration,
        userId: req.user?.id,
        userEmail: req.user?.email,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('[ApiLogMiddleware] Error saving log:', error);
    }
  });

  next();
};

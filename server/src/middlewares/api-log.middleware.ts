import { Request, Response, NextFunction } from 'express';
import { ApiLog } from '@/modules/analytics/models/api-log.model';
import { UAParser } from 'ua-parser-js';
import requestIp from 'request-ip';
import geoip from 'geoip-lite';
import axios from 'axios';

const sensitiveFields = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'oldPassword',
  'newPassword',
  'authorization',
  'cookie',
  'set-cookie'
];

const maskSensitiveData = (data: any): any => {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map(item => maskSensitiveData(item));
  }

  const maskedData = { ...data };
  for (const key of Object.keys(maskedData)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      maskedData[key] = '********';
    } else if (typeof maskedData[key] === 'object') {
      maskedData[key] = maskSensitiveData(maskedData[key]);
    }
  }
  return maskedData;
};

// Cache for location data to avoid hitting rate limits
const locationCache = new Map<string, { data: any, timestamp: number }>();
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

const fetchLocationData = async (ip: string) => {
  if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.') || ip.startsWith('::ffff:127.0.0.1')) {
    if (process.env.NODE_ENV === 'development') {
      return {
        country: 'Local Development',
        countryCode: 'LD',
        state: 'Local State',
        city: 'Local City',
        timezone: 'UTC',
        latitude: 0,
        longitude: 0,
        isp: 'Localhost',
        organization: 'Development',
      };
    }
    return null;
  }

  const cached = locationCache.get(ip);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }

  // 1. Try geoip-lite first (Offline, Fast)
  try {
    const geo = geoip.lookup(ip);
    if (geo) {
      const locationData = {
        country: geo.country, // Note: This is country code in geoip-lite
        countryCode: geo.country,
        state: geo.region,
        city: geo.city,
        timezone: geo.timezone,
        latitude: geo.ll[0],
        longitude: geo.ll[1],
        isp: 'Offline Database',
        organization: 'Offline Database',
      };
      locationCache.set(ip, { data: locationData, timestamp: Date.now() });
      return locationData;
    }
  } catch (error) {
    console.error(`[ApiLogMiddleware] geoip-lite error:`, error);
  }

  // 2. Fallback to ip-api.com (Online, More Accurate)
  try {
    const response = await axios.get(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,regionName,city,zip,timezone,lat,lon,isp,org`);
    const data = response.data;

    if (data.status === 'success') {
      const locationData = {
        country: data.country,
        countryCode: data.countryCode,
        state: data.regionName,
        city: data.city,
        postalCode: data.zip,
        timezone: data.timezone,
        latitude: data.lat,
        longitude: data.lon,
        isp: data.isp,
        organization: data.org,
      };
      locationCache.set(ip, { data: locationData, timestamp: Date.now() });
      return locationData;
    }
  } catch (error) {
    console.error(`[ApiLogMiddleware] ip-api.com error:`, error);
  }

  return null;
};

export const apiLogMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Don't log health check or logs endpoint itself to avoid bloat/infinite loops
  const excludedPaths = ['/health', '/superadmin/logs', '/api/v1/health'];
  if (excludedPaths.some(path => req.originalUrl.includes(path))) {
    return next();
  }

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

    try {
      let parsedResBody = responseBody;
      if (typeof responseBody === 'string') {
        try {
          parsedResBody = JSON.parse(responseBody);
        } catch (e) {
          // Keep as string if not JSON
        }
      }

      const clientIp = requestIp.getClientIp(req) || req.ip || req.socket.remoteAddress || '';
      const ua = new UAParser(req.headers['user-agent']);
      const browser = ua.getBrowser();
      const os = ua.getOS();
      const device = ua.getDevice();

      const locationData = await fetchLocationData(clientIp);

      await ApiLog.create({
        method: req.method,
        url: req.originalUrl,
        headers: maskSensitiveData(req.headers),
        query: maskSensitiveData(req.query),
        body: maskSensitiveData(req.body),
        ip: clientIp,
        statusCode: res.statusCode,
        responseHeaders: maskSensitiveData(res.getHeaders()),
        responseBody: maskSensitiveData(parsedResBody),
        duration,
        userId: req.user?.id,
        userEmail: req.user?.email,
        device: {
          deviceType: device.type || 'desktop',
          deviceVendor: device.vendor,
          deviceModel: device.model,
          browserName: browser.name,
          browserVersion: browser.version,
          osName: os.name,
          osVersion: os.version,
        },
        network: {
          ipAddress: clientIp,
          requestMethod: req.method,
          endpoint: req.originalUrl,
          host: req.get('host'),
          protocol: req.protocol,
        },
        location: locationData || undefined,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('[ApiLogMiddleware] Error saving log:', error);
    }
  });

  next();
};

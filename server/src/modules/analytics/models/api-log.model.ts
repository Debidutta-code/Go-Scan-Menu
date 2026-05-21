import mongoose, { Schema, Document } from 'mongoose';

export interface IApiLog extends Document {
  method: string;
  url: string;
  headers: Record<string, any>;
  query: Record<string, any>;
  body: any;
  ip: string;
  statusCode: number;
  responseHeaders?: Record<string, any>;
  responseBody: any;
  duration: number;
  userId?: string;
  userEmail?: string;
  device?: {
    deviceType?: string;
    deviceVendor?: string;
    deviceModel?: string;
    browserName?: string;
    browserVersion?: string;
    osName?: string;
    osVersion?: string;
  };
  network?: {
    ipAddress?: string;
    requestMethod?: string;
    endpoint?: string;
    host?: string;
    protocol?: string;
  };
  location?: {
    country?: string;
    countryCode?: string;
    state?: string;
    city?: string;
    postalCode?: string;
    timezone?: string;
    latitude?: number;
    longitude?: number;
    isp?: string;
    organization?: string;
  };
  timestamp: Date;
}

const apiLogSchema = new Schema<IApiLog>(
  {
    method: { type: String, required: true },
    url: { type: String, required: true },
    headers: { type: Object },
    query: { type: Object },
    body: { type: Schema.Types.Mixed },
    ip: { type: String },
    statusCode: { type: Number },
    responseHeaders: { type: Object },
    responseBody: { type: Schema.Types.Mixed },
    duration: { type: Number },
    userId: { type: String },
    userEmail: { type: String },
    device: {
      deviceType: String,
      deviceVendor: String,
      deviceModel: String,
      browserName: String,
      browserVersion: String,
      osName: String,
      osVersion: String,
    },
    network: {
      ipAddress: String,
      requestMethod: String,
      endpoint: String,
      host: String,
      protocol: String,
    },
    location: {
      country: String,
      countryCode: String,
      state: String,
      city: String,
      postalCode: String,
      timezone: String,
      latitude: Number,
      longitude: Number,
      isp: String,
      organization: String,
    },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

// Index for better query performance
apiLogSchema.index({ timestamp: -1 });
apiLogSchema.index({ userId: 1 });
apiLogSchema.index({ method: 1 });
apiLogSchema.index({ statusCode: 1 });

export const ApiLog = mongoose.model<IApiLog>('ApiLog', apiLogSchema);

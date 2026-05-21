import mongoose, { Schema, Document } from 'mongoose';

export interface IApiLog extends Document {
  method: string;
  url: string;
  headers: Record<string, any>;
  query: Record<string, any>;
  body: any;
  ip: string;
  statusCode: number;
  responseBody: any;
  duration: number;
  userId?: string;
  userEmail?: string;
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
    responseBody: { type: Schema.Types.Mixed },
    duration: { type: Number },
    userId: { type: String },
    userEmail: { type: String },
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

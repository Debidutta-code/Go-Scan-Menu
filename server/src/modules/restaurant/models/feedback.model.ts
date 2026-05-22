import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IFeedback extends Document {
  restaurantId: Types.ObjectId;
  food: number;
  service: number;
  cleanliness: number;
  atmosphere: number;
  valueForMoney: number;
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
  {
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: 'Restaurant',
      required: true,
    },
    food: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    service: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    cleanliness: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    atmosphere: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    valueForMoney: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
feedbackSchema.index({ restaurantId: 1, createdAt: -1 });

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);

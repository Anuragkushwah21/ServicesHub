import mongoose, { Document, Schema } from 'mongoose';

export interface IService extends Document {
  vendorId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  image?: string;
  rating: number;
  totalBookings: number;
  availability: {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
    saturday: boolean;
    sunday: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    vendorId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Vendor', 
      required: true 
    },
    categoryId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Category', 
      required: true 
    },
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    duration: { type: Number, required: true }, // in minutes
    image: String,
    rating: { type: Number, default: 5, min: 1, max: 5 },
    totalBookings: { type: Number, default: 0 },
    availability: {
      monday: { type: Boolean, default: true },
      tuesday: { type: Boolean, default: true },
      wednesday: { type: Boolean, default: true },
      thursday: { type: Boolean, default: true },
      friday: { type: Boolean, default: true },
      saturday: { type: Boolean, default: true },
      sunday: { type: Boolean, default: true },
    },
  },
  { timestamps: true }
);

export default mongoose.models.Service || mongoose.model<IService>('Service', serviceSchema);

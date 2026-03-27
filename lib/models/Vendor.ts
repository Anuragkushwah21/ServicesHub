import mongoose, { Document, Schema } from 'mongoose';

export interface IVendor extends Document {
  userId: mongoose.Types.ObjectId;
  businessName: string;
  description: string;
  logo?: string;
  banner?: string;
  rating: number;
  totalBookings: number;
  categories: mongoose.Types.ObjectId[];
  businessType?: string;
  experience?: number;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  website?: string;
  bankAccount?: string;
  profileCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const vendorSchema = new Schema<IVendor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    businessName: {
      type: String,
      required: true,
    },

    // ❗ NOT required here (API will validate)
    description: {
      type: String,
      default: '',
    },

    logo: String,
    banner: String,

    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },

    totalBookings: {
      type: Number,
      default: 0,
    },

    categories: {
      type: [Schema.Types.ObjectId],
      ref: 'Category',
      default: [],
    },
    businessType: String,

    experience: {
      type: Number,
      default: 0,
    },

    phone: String,
    address: String,
    city: String,
    state: String,
    zipCode: String,
    website: {
      type: String,
      default: '',
      trim: true,
    },
    bankAccount: String,

    profileCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Vendor ||
  mongoose.model<IVendor>('Vendor', vendorSchema);
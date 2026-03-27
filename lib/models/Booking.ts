import mongoose, { Document, Schema } from 'mongoose';

export interface IBooking extends Document {
  userId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  vendorId: mongoose.Types.ObjectId;
  bookingDate: Date;
  bookingTime: string; // HH:MM format
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  price: number;
  notes?: string;
  customerName?: string;
  phone?: string;
  city?: string;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    vendorId: {
      type: Schema.Types.ObjectId,
      ref: 'Vendor',
      required: true,
    },
    bookingDate: { type: Date, required: true },
    bookingTime: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    price: { type: Number, required: true },
    notes: String,

    // new optional fields if you need them
    customerName: { type: String },
    phone: { type: String },
    city: { type: String },
  },
  { timestamps: true },
);


export default mongoose.models.Booking || mongoose.model<IBooking>('Booking', bookingSchema);

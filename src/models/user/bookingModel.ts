import mongoose, { Schema, model, Document } from "mongoose";

export interface IBooking extends Document {
    doctorId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    slotId: mongoose.Types.ObjectId;
    paymentStatus: "processing" | "paid" | "failed" | "refunded";
    bookingStatus: "processing" | "booked" | "cancelled"

};


const bookingSchema = new Schema<IBooking>({
    doctorId: { type: Schema.Types.ObjectId, required: true, ref: "Doctor" },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    slotId: { type: Schema.Types.ObjectId, required: true, ref: "slots" },
    paymentStatus: {
        type: String,
        enum: ["processing", "paid", "failed", "refunded"],
        default: "processing"
    },
    bookingStatus: {
        type: String,
        enum: ["processing", "booked", "cancelled"],
        default: "processing"
    },
}, { timestamps: true });

const BookingModel = model<IBooking>("bookings", bookingSchema);

export default BookingModel;

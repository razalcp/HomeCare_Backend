import mongoose, { Schema, model, Document } from "mongoose";

export interface IBooking extends Document {
    doctorId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    slotId: mongoose.Types.ObjectId;
    paymentStatus: "processing" | "paid" | "failed";
}

const bookingSchema = new Schema<IBooking>({
    doctorId: { type: Schema.Types.ObjectId, required: true, ref: "Doctor" },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    slotId: { type: Schema.Types.ObjectId, required: true, ref: "slots" },
    paymentStatus: {
        type: String,
        enum: ["processing", "paid", "failed"],
        default: "processing"
    }
}, { timestamps: true });

const BookingModel = model<IBooking>("bookings", bookingSchema);

export default BookingModel;

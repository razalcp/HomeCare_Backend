import mongoose, { Schema, model, Document } from "mongoose";

export interface ISlot extends Document {
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    doctorId: mongoose.Types.ObjectId;
}

const slotSchema = new Schema<ISlot>({
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    status: { type: String, required: true, enum: ["Available", "Booked", "Cancelled"] },
    doctorId: { type: Schema.Types.ObjectId, required: true, ref: "Doctor" }

});

const SlotModel = model<ISlot>("slots", slotSchema);

export default SlotModel;

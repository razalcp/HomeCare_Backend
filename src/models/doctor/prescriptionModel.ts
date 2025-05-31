import mongoose, { Schema, model, Document } from "mongoose";

interface IMedication {
  name: string;
  dosage: string;
  count: string;
  instruction: string;
}

export interface IPrescription extends Document {
  bookingId: mongoose.Types.ObjectId;
  patientAdvice: string;
  medications: IMedication[];
  userId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
}

const medicationSchema = new Schema<IMedication>(
  {
    name: { type: String, required: true },
    dosage: { type: String, required: true },
    count: { type: String, required: true },
    instruction: { type: String, required: true }
  },
  { _id: false } // No _id for subdocuments unless required
);

const prescriptionSchema = new Schema<IPrescription>(
  {
    bookingId: { type: Schema.Types.ObjectId, required: true, ref: "bookings" },
    patientAdvice: { type: String, required: true },
    medications: { type: [medicationSchema], required: true },
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    doctorId: { type: Schema.Types.ObjectId, required: true, ref: "Doctor" }
  },
  { timestamps: true }
);

const PrescriptionModel = model<IPrescription>("prescriptions", prescriptionSchema);

export default PrescriptionModel;

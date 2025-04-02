import mongoose, { Schema, model, Document } from 'mongoose';
import IDoctorModel from '../../interfaces/doctor/doctorModelInterface';




// Interface for the Doctor Model
export interface IDoctor extends Document {
  name: string,
  email: string;
  profileImage: string;
  certifications0: string;
  certifications1: string;
  certifications2: string;
  certifications3: string;
  doctorName: string;
  departments: mongoose.Types.ObjectId[];
  doctorImage?: string;
  mobileNumber?: string;


  state: string;

  country: string;
  slotId?: mongoose.Types.ObjectId[];
  experience?: string;
  dateOfBirth?: String;
  bio?: string;
  knownLanguages?: string[];
  degree?: string;
  institution?: string;
  year?: string;
  medicalLicenceNumber: string;
  consultationType?: string[];
  consultationFee?: number;
  certifications?: string[];
  isVerified: Boolean;
  kycStatus?: String

}

// Doctor Schema
const DoctorSchema = new Schema<IDoctor>({
  name: { type: String },
  profileImage: { type: String },
  certifications0: { type: String },
  certifications1: { type: String },
  certifications2: { type: String },
  certifications3: { type: String },

  doctorImage: { type: String },
  mobileNumber: { type: String },
  email: { type: String },

  // Merged Address Fields

  state: { type: String },

  country: { type: String },

  slotId: [{ type: mongoose.Types.ObjectId, ref: 'Slot' }],
  experience: { type: String },
  dateOfBirth: { type: String },
  bio: { type: String },
  departments: [{ type: String }],
  knownLanguages: [{ type: String }],
  degree: { type: String },
  institution: { type: String },
  year: { type: String },
  medicalLicenceNumber: { type: String, unique: true },
  consultationType: [{ type: String }],
  consultationFee: { type: Number },
  certifications: [{ type: String }],
  isVerified: { type: Boolean, default: false },
  kycStatus: { type: String, default: "Pending" }
}, { timestamps: true });



const DoctorModel = model<IDoctorModel>('Doctor', DoctorSchema);

export default DoctorModel;
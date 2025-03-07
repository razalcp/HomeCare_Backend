import { Schema, model, Document } from "mongoose";
import { IUserModel } from "../../interfaces/user/userModelInterface";
import { IMedicalRecords } from "../../interfaces/user/userInterface";

const medicalRecordSchema = new Schema({
  fileName: { type: String },
  fileUrl: { type: String },
  uploadDate: { type: Date },
});


const userSchema: Schema = new Schema<IUserModel>({
  name: {
    type: String,
  },
  email: {
    type: String,
    unique: true
  },
  mobile: {
    type: String,
    unique: true
  },
  password: {
    type: String,
  },
  dob: {
    type: Date,
  },
  profileIMG: {
    type: String,
  },
  walletBalance: {
    type: Number,
  },
  medicalRecords: {
    type: [medicalRecordSchema],
  },
  isUserBlocked: {
    type: Boolean,
    default: false,
  },
});

const User = model<IUserModel>("User", userSchema);

export default User;

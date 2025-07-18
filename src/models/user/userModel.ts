import { Schema, model, Document } from "mongoose";
import { IUserModel } from "../../interfaces/user/userModelInterface";


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
    unique: true,
  },
  mobile: {
    type: String,
    unique: true,
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
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
  },
  age: {
    type: Number,
  },
  bloodGroup: {
    type: String,
  },
  allergies: {
    type: [String],
    default: [],
  },
  currentMedications: {
    type: [String],
    default: [],
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
  }
},

  { timestamps: true });


const User = model<IUserModel>("User", userSchema);

export default User;

export interface IUser {

  name: string,
  email: string,
  mobile: string,
  password: string,
  confirmPassword?: string,
  isUserBlocked: boolean
}

export interface IUserAuth {
  _id?: string;
  name: string;
  email: string;
  mobile: string;
  password?: string;
  dob?: Date;
  profileIMG?: string;
  walletBalance?: number;
  medicalRecords?: IMedicalRecords[];
  isUserBlocked?: boolean;
}

export interface IMedicalRecords {
  fileName: String,
  fileUrl: String,
  uploadDate: Date
}
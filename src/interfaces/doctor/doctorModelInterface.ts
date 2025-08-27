import mongoose from 'mongoose'

interface IDoctorAddress {
    city: string
    state: string
    zipcode: number
    country: string
}

interface IDoctorModel {
    _id?: mongoose.Types.ObjectId
    name: string,
    email: string;
    profileImage: string;
    certifications0: string;
    certifications1: string;
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
    isVerified: Boolean;
    kycStatus?: string;
    createdAt?: Date;
    updatedAt?: Date;

}


export default IDoctorModel
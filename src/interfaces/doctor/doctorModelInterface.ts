import mongoose from 'mongoose'

interface IDoctorAddress {
    city: string
    state: string
    zipcode: number
    country: string
}

interface IDoctorModel {
    _id?: mongoose.Types.ObjectId
    doctorName?: string

    departments?: mongoose.Types.ObjectId[]
    doctorImage?: string
    mobileNumber?: string
    email?: string
    doctorAddress?: IDoctorAddress
    slotId?: mongoose.Types.ObjectId[]
    dob?: Date
    experienceYears?: number
    bio?: string
    doctorEducationId?: mongoose.Types.ObjectId[]
    knownLanguages?: string[]
    medicalLicenceNumber?: string
    typesOfConsultation?: string[]
    consultationFee?: number
    certification?: string[]
    doctorTransactionsId?: mongoose.Types.ObjectId[]
    doctorWalletBalance?: number
    isBlocked?: boolean
    isVerified?: boolean
    isSubmitted?: boolean
    kycStatus?: String
    createdAt?: Date
    updatedAt?: Date
}


export default IDoctorModel
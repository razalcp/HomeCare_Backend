import { Types } from "mongoose";
import { IDoctor } from "../models/doctor/doctorModel";
import { IVerifiedDoctorData } from "../interfaces/user/userInterface"; // adjust path

export function mapDoctorsToResponse(data: any[]): IVerifiedDoctorData[] {
  return data.map((doc) => {
    const typedDoc = doc as unknown as IDoctor & { _id: Types.ObjectId; createdAt: Date; updatedAt: Date };

    return {
      _id: typedDoc._id.toString(),
      email: typedDoc.email,
      slotId: typedDoc.slotId?.map(id => id.toString()) ?? [],
      departments: typedDoc.departments?.map(id => id.toString()) ?? [],
      knownLanguages: typedDoc.knownLanguages ?? [],
      consultationType: typedDoc.consultationType ?? [],
      certifications: typedDoc.certifications ?? [],
      isVerified: !!typedDoc.isVerified,
      kycStatus: typedDoc.kycStatus ?? '',
      createdAt: typedDoc.createdAt?.toISOString() ?? '',
      updatedAt: typedDoc.updatedAt?.toISOString() ?? '',
      bio: typedDoc.bio ?? '',
      certifications0: typedDoc.certifications0 ?? '',
      certifications1: typedDoc.certifications1 ?? '',
      consultationFee: typedDoc.consultationFee ?? 0,
      country: typedDoc.country,
      dateOfBirth: typedDoc.dateOfBirth?.toString() ?? '',
      degree: typedDoc.degree ?? '',
      experience: typedDoc.experience ?? '',
      institution: typedDoc.institution ?? '',
      medicalLicenceNumber: typedDoc.medicalLicenceNumber ?? '',
      name: typedDoc.name ?? '',
      profileImage: typedDoc.profileImage ?? '',
      state: typedDoc.state ?? '',
      year: typedDoc.year ?? ''
    };
  });
}

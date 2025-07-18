import { IAdmin } from '../models/admin/adminModel';
import { AdminDto, IPatientDTO } from '../dtos/admin.dto';
import { IUserModel } from '../interfaces/user/userModelInterface';
import { IAdminAuth } from '../interfaces/admin/AdminInterface';

export const mapAdminToDto = (admin: IAdminAuth): AdminDto => {
  return {
    _id: admin._id.toString(),
    email: admin.email,
  };
};

export const mapPatientToDTO = (patient: IUserModel): IPatientDTO => ({
  _id: patient._id?.toString() || '',
  name: patient.name,
  email: patient.email,
  mobile: patient.mobile,
  isUserBlocked: patient.isUserBlocked,
  createdAt: patient.createdAt,
  updatedAt: patient.updatedAt,
});
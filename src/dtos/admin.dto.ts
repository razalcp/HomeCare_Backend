export interface AdminDto {
  _id: string;
  email: string;
}


export interface IPatientDTO {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  isUserBlocked?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DepartmentDTO {
    _id: string;
     departmentName: string;
    isListed: boolean;
}
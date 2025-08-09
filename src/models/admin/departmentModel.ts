import { Schema, model, Document, Types } from "mongoose";

export interface IDepartment {
    _id: Types.ObjectId;
    departmentName: string;
    isListed: boolean;
}
export type DepartmentDocument = IDepartment & Document

const departmentSchema = new Schema<DepartmentDocument>({
    departmentName: { type: String },
    isListed: { type: Boolean, default: true },
});

const DepartmentModel = model("department", departmentSchema);

export default DepartmentModel;

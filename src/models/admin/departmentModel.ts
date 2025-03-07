import { Schema, model, Document } from "mongoose";

export interface IDepartment extends Document {
    departmentName: string;
    isListed: boolean;
}

const departmentSchema = new Schema<IDepartment>({
    departmentName: { type: String },
    isListed: { type: Boolean, default: true },
});

const DepartmentModel = model("department", departmentSchema);

export default DepartmentModel;

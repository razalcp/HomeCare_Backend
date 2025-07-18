import { Schema, model, Document } from 'mongoose'

export interface IAdmin extends Document {
    _id: string;
    email: string
    password: string
}

const adminSchema = new Schema<IAdmin>({
    email: { type: String },
    password: { type: String }
})

const AdminModel = model('admin', adminSchema)

export default AdminModel;
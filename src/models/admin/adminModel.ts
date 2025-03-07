import { Schema, model, Document } from 'mongoose'

export interface IAdmin extends Document {
    email: String
    password: String
}

const adminSchema = new Schema<IAdmin>({
    email: { type: String },
    password: { type: String }
})

const AdminModel = model('admin', adminSchema)

export default AdminModel;
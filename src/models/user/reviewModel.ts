import mongoose, { Schema, model } from 'mongoose'


interface IReview {
    userId: mongoose.Types.ObjectId
    doctorId: mongoose.Types.ObjectId
    rating: number
    comment: string
}
const reviewSchema = new Schema<IReview>({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: 'Doctor', required: true },
    rating: { type: Number, required: true },
    comment: { type: String, required: true }
}, { timestamps: true })

const ReviewModel = model<IReview>('Review', reviewSchema)

export default ReviewModel
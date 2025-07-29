import { Types } from "mongoose";
import { IReview } from "../interfaces/user/userInterface";


export interface PopulatedReviewDocument {
  _id: Types.ObjectId;
  doctorId: Types.ObjectId;
  rating: number;
  comment: string;
  createdAt: Date;
  updatedAt: Date;
  userId: {
    _id: Types.ObjectId;
    name: string;
    profileIMG: string;
  };
}

export const mapReviewDocument = (review: PopulatedReviewDocument): IReview => {
  
    return {
        _id: review._id.toString(),
        doctorId: review.doctorId.toString(),
        comment: review.comment,
        rating: review.rating,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        userId: {
            _id: review.userId._id.toString(),
            name: review.userId.name,
            profileIMG: review.userId.profileIMG,
        },
    };
};
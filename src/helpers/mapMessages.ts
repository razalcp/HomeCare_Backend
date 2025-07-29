import { IMessageSaveResponse } from "../interfaces/user/userInterface";
import { IMessage } from "../models/messageModel";

export const mapMessages = (message: IMessage): IMessageSaveResponse => {
  return {
    _id: message._id.toString(),
    senderId: message.senderId.toString(),
    receiverId: message.receiverId.toString(),
    message: message.message,
    image: message.image,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
};
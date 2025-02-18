import mongoose, { Document } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type: "FOLLOW" | "LIKE" | "COMMENT" | "REPLY";
  post?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
}

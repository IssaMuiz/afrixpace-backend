import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  createdAt: Date;
}

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const model = mongoose.model<IUser>("User", UserSchema);

export default model;

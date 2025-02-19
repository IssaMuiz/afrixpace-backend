import mongoose, { Document } from "mongoose";

export interface UserDocument extends Document {
  username: string;
  email: string;
  password: string;
  followers: mongoose.Types.ObjectId[];
  following: mongoose.Types.ObjectId[];
  image?: string;
  bio?: string;
  createdAt: Date;
}

const UserSchema = new mongoose.Schema<UserDocument>(
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
    followers: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
    ],
    following: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
    ],

    image: {
      type: String,
    },
    bio: {
      type: String,
    },
  },
  { timestamps: true }
);

UserSchema.index({ image: 1 });

const model = mongoose.model<UserDocument>("User", UserSchema);

export default model;

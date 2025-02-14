import mongoose, { Document } from "mongoose";

export interface UserDocument extends Document {
  _id: mongoose.Types.ObjectId;
  username: String;
  email: String;
  password: String;
}

const UserSchema = new mongoose.Schema({
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
});

const model = mongoose.model<UserDocument>("User", UserSchema);

export default model;

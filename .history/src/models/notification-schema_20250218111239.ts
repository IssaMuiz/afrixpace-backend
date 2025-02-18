import mongoose, { Document, mongo } from "mongoose";

export interface INotification extends Document {
  recipient: mongoose.Types.ObjectId;
  sender: mongoose.Types.ObjectId;
  type:
    | "FOLLOW"
    | "UNFOLLOW"
    | "UPVOTE"
    | "DOWNVOTE"
    | "LIKE"
    | "COMMENT"
    | "REPLY";
  post?: mongoose.Types.ObjectId;
  comment?: mongoose.Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new mongoose.Schema<INotification>(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: [
        "FOLLOW",
        "UNFOLLOW",
        "UPVOTE",
        "DOWNVOTE",
        "LIKE",
        "COMMENT",
        "REPLY",
      ],
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: false,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      required: false,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const model = mongoose.model<INotification>("Notification", NotificationSchema);

export default model;

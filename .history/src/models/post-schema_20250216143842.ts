import mongoose, { Document } from "mongoose";

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: "Entrepreneur" | "Technology";
  media: {
    url: string;
    mediaTypes: "image" | "video";
    publicId: string;
  };
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  votesCount: number;
  comments: mongoose.Types.ObjectId[];
  commentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new mongoose.Schema<IPost>(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    media: {
      url: { type: String, required: true },
      mediaTypes: {
        type: String,
        enum: ["image", "video"],
        required: true,
      },
      publicId: { type: String, default: "" },
    },
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    commentCount: {
      type: Number,
      default: 0,
    },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    downvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    votesCount: {
      type: Number,
      default: 0,
    },
    category: {
      type: String,
      enum: ["Entrepreneur", "Technology"],
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const model = mongoose.model<IPost>("Post", PostSchema);

export default model;

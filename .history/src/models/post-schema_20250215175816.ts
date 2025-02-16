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
  }[];
  votes: {
    user: mongoose.Types.ObjectId;
    voteTypes: "upvote" | "downvote";
  };
  comments: mongoose.Types.ObjectId[];
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
    votes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        voteTypes: {
          type: String,
          enum: ["upvote", "downvote"],
          required: true,
        },
      },
    ],
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

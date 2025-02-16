import mongoose, { Document } from "mongoose";

export interface IPost extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  content: string;
  category: "Entrepreneur" | "Technology";
  media: {
    url: String;
    mediaTypes: "image" | "video";
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
      types: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    media: [
      {
        url: { type: String, required: true },
        mediaTypes: { type: String, enum: ["image", "video"], required: true },
      },
    ],

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
  },
  { timestamps: true }
);

const model = mongoose.model<IPost>("Post", PostSchema);

export default model;

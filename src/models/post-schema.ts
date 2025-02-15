import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    mediaUrl: {
      type: String,
      required: true,
    },
    mediaType: {
      type: String,
      enum: ["image", "video"],
      required: true,
    },

    comments: {
      type: String,
    },
    voting: {
      type: Number,
    },
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const model = mongoose.model("Post", PostSchema);

export default model;

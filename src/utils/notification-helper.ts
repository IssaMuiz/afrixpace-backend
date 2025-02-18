import Notification, { INotification } from "../models/notification-schema";
import { Server } from "socket.io";
import mongoose, { ObjectId } from "mongoose";

/**
 * @param recipientId
 * @param senderId
 * @param type
 * @param message
 * @param postId
 * @param commentId
 * @param io
 */

export const sendNotification = async (
  recipientId: mongoose.Types.ObjectId,
  senderId: mongoose.Types.ObjectId,
  type:
    | "FOLLOW"
    | "UNFOLLOW"
    | "UPVOTE"
    | "DOWNVOTE"
    | "LIKE"
    | "COMMENT"
    | "REPLY",
  message: string,
  io: Server,
  postId?: string,
  commentId?: string
) => {
  console.log(
    `Sending notification: recipient=${recipientId}, sender=${senderId}, type=${type}`
  );
  try {
    const newNotification = new Notification({
      recipient: recipientId,
      sender: senderId,
      type,
      message,
      post: postId,
      comment: commentId,
    });

    await newNotification.save();

    io.to(recipientId.toString()).emit("newNotification", newNotification);
  } catch (error) {
    console.error("Error sending notification", error);
  }
};

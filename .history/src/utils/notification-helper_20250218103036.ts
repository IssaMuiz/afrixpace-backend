import Notification, { INotification } from "../models/notification-schema";
import { Server } from "socket.io";

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
  recipientId: string,
  senderId: string,
  type: "FOLLOW" | "UNFOLLOW" | "LIKE" | "COMMENT" | "REPLY",
  message: string,
  io: Server,
  postId?: string,
  commentId?: string
) => {
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

    io.to(recipientId).emit("newNotification", newNotification);
  } catch (error) {
    console.error("Error sending notification", error);
  }
};

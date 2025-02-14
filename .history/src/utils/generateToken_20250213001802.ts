import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

export const generateToken = (userId: ObjectId | undefined) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET_KEY as string,
    {
      expiresIn: "1d",
    }
  );
};

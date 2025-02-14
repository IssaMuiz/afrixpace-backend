import { Request } from "express";
import User from "../src/models/user-schema";
import { Document } from "mongodb";

type UserDocument = Document & typeof User;

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

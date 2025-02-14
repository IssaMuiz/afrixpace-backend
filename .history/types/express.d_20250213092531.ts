import { UserDocument } from "../src/models/user-schema";
import { Request } from "express";

declare module "express" {
  export interface Request {
    user?: UserDocument;
  }
}

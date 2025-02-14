import { UserDocument } from "../src/models/user-schema";

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument;
    }
  }
}

import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  user?: string | JwtPayload;
}

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];

  console.log(authHeader);

  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.json({
      success: false,
      message: "Access denied! No token provided, Please login",
    });
  }

  try {
    const decodeToken = jwt.verify(
      token as string,
      process.env.JWT_SECRET_KEY as string
    ) as JwtPayload;

    console.log(decodeToken);
    req.user = decodeToken;

    next();
  } catch (error) {
    console.error("Invalid Token");

    res.status(401).json({
      success: false,
      message: "Invalid Token",
    });
  }
};

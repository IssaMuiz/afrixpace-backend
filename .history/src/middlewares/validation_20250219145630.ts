import { body, param, validationResult } from "express-validator";
import { Request, Response, NextFunction } from "express";
import sanitizeHtml from "sanitize-html";

export const validatePost = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required!")
    .isLength({ min: 5 })
    .withMessage("Title must be at least 5 characters long")
    .customSanitizer((value) => sanitizeHtml(value)),

  body("content")
    .trim()
    .notEmpty()
    .withMessage("Content is required")
    .customSanitizer((value) => sanitizeHtml(value)),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    next();
  },
] as unknown as ((req: Request, res: Response, next: NextFunction) => void)[];

export const validateUserInput = [
  body("email").isEmail().withMessage("Invalid email format"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("username").trim().escape(),

  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        errors: errors.array(),
      });
    }

    next();
  },
];

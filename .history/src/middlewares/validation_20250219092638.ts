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
];

export const validateUserId = [
  param("id").isMongoId().withMessage("Invalid User ID"),

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

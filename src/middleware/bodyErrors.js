import { validationResult } from "express-validator";

export const bodyErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ error: true, msg: "body is invalid", result: [] });
  }
  next();
};

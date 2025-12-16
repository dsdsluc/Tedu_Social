import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { DataStoredInToken } from "@modules/auth";

export const optionalAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.header("Authorization");

  // Không có token → cho qua
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret = process.env.JWT_TOKEN_SECRET;
    if (!secret) {
      return res.status(500).json({ message: "JWT secret is not configured" });
    }

    const decoded = jwt.verify(token, secret) as DataStoredInToken;

    req.user = {
      id: decoded.id,
    };

    next();
  } catch (error) {
    // Token sai → báo lỗi
    return res.status(401).json({ message: "Token is not valid" });
  }
};

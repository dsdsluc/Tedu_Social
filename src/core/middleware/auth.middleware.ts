import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

import { DataStoredInToken } from "@modules/auth/auth.interface";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.header("Authorization");

  // Authorization: Bearer <token>
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied." });
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
    return res.status(401).json({ message: "Token is not valid" });
  }
};

export default authMiddleware;

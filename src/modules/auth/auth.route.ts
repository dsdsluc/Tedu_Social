import { Router } from "express";
import { Route } from "@core/interfaces";

import AuthController from "./auth.controller";
import LoginDto from "./auth.dto";
import validationMiddleware from "@core/middleware/validation.middleware";
import authMiddleware from "@core/middleware/auth.middleware";

export default class AuthRoute implements Route {
  public path = "/api/auth";
  public router = Router();

  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // login
    this.router.post(
      "/",
      validationMiddleware(LoginDto),
      this.authController.login
    );

    // 🔥 get current user
    this.router.get("/me", authMiddleware, this.authController.getCurrentUser);
  }
}

import { Router } from "express";
import { Route } from "@core/interfaces";

import AuthController from "./auth.controller";
import LoginDto from "./auth.dto";
import validationMiddleware from "@core/middleware/validation.middleware";
import authMiddleware from "@core/middleware/auth.middleware";

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication APIs
 */

export default class AuthRoute implements Route {
  public path = "/api/auth";
  public router = Router();

  public authController = new AuthController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    /**
     * @swagger
     * /api/auth:
     *   post:
     *     summary: Login
     *     tags: [Auth]
     *     requestBody:
     *       required: true
     *       content:
     *         application/json:
     *           schema:
     *             type: object
     *             required:
     *               - email
     *               - password
     *             properties:
     *               email:
     *                 type: string
     *               password:
     *                 type: string
     *     responses:
     *       200:
     *         description: Login success
     */
    this.router.post(
      "/",
      validationMiddleware(LoginDto),
      this.authController.login
    );

    /**
     * @swagger
     * /api/auth/me:
     *   get:
     *     summary: Get current user
     *     tags: [Auth]
     *     security:
     *       - bearerAuth: []
     *     responses:
     *       200:
     *         description: Current user info
     *       401:
     *         description: Unauthorized
     */
    this.router.get("/me", authMiddleware, this.authController.getCurrentUser);
  }
}

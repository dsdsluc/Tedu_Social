import { Router } from "express";
import { Route } from "@core/interfaces";

import UsersController from "./users.controller";
import RegisterDto from "./dtos/register.dto";
import UpdateUserDto from "./dtos/update-user.dto";

import validationMiddleware from "@core/middleware/validation.middleware";

export default class UsersRoute implements Route {
  public path = "/api/users";
  public router = Router();
  private usersController = new UsersController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    // POST /api/users
    this.router.post(
      "/",
      validationMiddleware(RegisterDto),
      this.usersController.register
    );

    // GET /api/users
    this.router.get("/", this.usersController.getAll);

    // GET /api/users/paging?page=1&keyword=abc
    this.router.get("/paging", this.usersController.getAllPaging);

    // GET /api/users/:id
    this.router.get("/:id", this.usersController.getUserById);

    // PUT /api/users/:id
    this.router.put(
      "/:id",
      validationMiddleware(UpdateUserDto, true),
      this.usersController.updateUser
    );

    // DELETE /api/users/:id
    this.router.delete("/:id", this.usersController.deleteUser);

    // RESTORE /api/users/:id/restore
    this.router.put("/:id/restore", this.usersController.restoreUser);
  }
}

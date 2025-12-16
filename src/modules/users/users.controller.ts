import { NextFunction, Request, Response } from "express";
import mongoose from "mongoose";

import RegisterDto from "./dtos/register.dto";
import UpdateUserDto from "./dtos/update-user.dto";
import UserService from "./users.service";
import { TokenData } from "@modules/auth";
import { HttpException } from "@core/exceptions";

export default class UsersController {
  private userService = new UserService();

  // ==========================
  // REGISTER
  // ==========================
  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const model: RegisterDto = req.body; // đã validate
      const tokenData: TokenData = await this.userService.createUser(model);
      res.status(201).json(tokenData);
    } catch (error) {
      next(error);
    }
  };

  // ==========================
  // GET USER BY ID
  // ==========================
  public getUserById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new HttpException(400, "Invalid user id");
      }

      const user = await this.userService.getUserById(id);
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  // ==========================
  // GET ALL USERS
  // ==========================
  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAll();
      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  };

  // ==========================
  // GET PAGINATED USERS
  // ==========================
  public getAllPaging = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const page = Number(req.query.page) || 1;
      const keyword = (req.query.keyword as string) || "";

      if (page < 1) {
        throw new HttpException(400, "Page must be greater than 0");
      }

      const paginationResult = await this.userService.getAllPaging(
        keyword,
        page
      );

      res.status(200).json(paginationResult);
    } catch (error) {
      next(error);
    }
  };

  // ==========================
  // UPDATE USER
  // ==========================
  public updateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new HttpException(400, "Invalid user id");
      }

      const model: UpdateUserDto = req.body;
      const user = await this.userService.updateUser(id, model);

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  };

  // ==========================
  // DELETE USER (SOFT DELETE)
  // ==========================
  public deleteUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      // validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new HttpException(400, "Invalid user id");
      }

      const user = await this.userService.deleteUser(id);

      res.status(200).json({
        message: "User deleted successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  };
  // ==========================
  // RESTORE USER
  // ==========================
  public restoreUser = async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { id } = req.params;

      // validate ObjectId
      if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new HttpException(400, "Invalid user id");
      }

      const user = await this.userService.restoreUser(id);

      res.status(200).json({
        message: "User restored successfully",
        user,
      });
    } catch (error) {
      next(error);
    }
  };
}

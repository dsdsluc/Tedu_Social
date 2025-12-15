import { NextFunction, Request, RequestHandler, Response } from "express";
import { ValidationError, validate } from "class-validator";
import { plainToClass } from "class-transformer";

import { HttpException } from "@core/exceptions";

const validationMiddleware = (
  type: any,
  skipMissingProperties = false
): RequestHandler => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const dto = plainToClass(type, req.body);
    const errors: ValidationError[] = await validate(dto, {
      skipMissingProperties,
    });

    if (errors.length > 0) {
      const messages = errors
        .map((error: ValidationError) => Object.values(error.constraints || {}))
        .flat()
        .join(", ");

      return next(new HttpException(400, messages));
    }

    // ✅ QUAN TRỌNG NHẤT
    req.body = dto;
    next();
  };
};

export default validationMiddleware;

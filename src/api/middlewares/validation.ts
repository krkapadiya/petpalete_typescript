import { removeFile } from "./../../util/remove_file";
import { errorRes } from "../../util/response_functions";
import { Request, Response, NextFunction } from "express";
import express from "express";

interface FileRequest extends Request {
  files?:
    | Express.Multer.File[]
    | { [fieldname: string]: Express.Multer.File[] };
  body: any;
}

export const validateRequest = (schema: any) => {
  return async (
    req: FileRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const option = {
        abortEarly: false,
        errors: {
          wrap: {
            label: "",
          },
        },
      };

      const { error } = await schema.validate(req.body, option);

      if (error) {
        throw error;
      }

      next();
    } catch (error: any) {
      const { body, files } = req;

      if (Array.isArray(files)) {
        // Case when `files` is an array (multer single/multiple)
        for (const file of files) {
          if (file.fieldname && body[file.fieldname]) {
            removeFile(body[file.fieldname]);
          }
        }
      } else if (files && typeof files === "object") {
        // Case when `files` is an object (multer.fields)
        for (const field in files) {
          if (body[field]) {
            removeFile(body[field]);
          }
        }
      }

      const errorMsg = error?.details?.[0]?.message || "Validation failed";
      await errorRes(res, errorMsg);
    }
  };
};

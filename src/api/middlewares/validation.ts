import { removeFile } from "./../../util/remove_file";
import { errorRes } from "../../util/response_functions";
import { Request, Response, NextFunction } from "express";
import { File as MulterFile } from "multer";
export interface FileRequest extends Request {
  files?:
    | MulterFile[] // e.g. req.files as array
    | { [fieldname: string]: MulterFile[] }; // e.g. req.files as object

  body: Record<string, unknown>;
}

export const validateRequest = (schema: {
  validate: (
    data: unknown,
    options?: { abortEarly?: boolean },
  ) => { error?: Error };
}) => {
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
    } catch (error: unknown) {
      const { body, files } = req;

      if (Array.isArray(files)) {
        for (const file of files) {
          const fieldValue = body[file.fieldname];
          if (file.fieldname && fieldValue && typeof fieldValue === "string") {
            removeFile(fieldValue);
          }
        }
      } else if (files && typeof files === "object") {
        for (const field in files) {
          const fieldValue = body[field];
          if (fieldValue && typeof fieldValue === "string") {
            removeFile(fieldValue);
          }
        }
      }

      const errorMsg =
        error instanceof Error ? error.message : "Validation failed";
      await errorRes(res, errorMsg);
    }
  };
};

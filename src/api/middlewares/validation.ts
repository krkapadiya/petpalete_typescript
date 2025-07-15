import { removeFile } from "./../../util/remove_file";
import { errorRes } from "./../../util/response_functions";
import { Request, Response, NextFunction } from "express";
import type { File as MulterFile } from "multer";

interface FileRequest extends Request {
  files?: MulterFile[] | { [fieldname: string]: MulterFile[] };
  body: Record<string, unknown>;
}

interface SchemaValidator {
  validate: (
    data: unknown,
    options?: { abortEarly?: boolean; errors?: { wrap?: { label?: string } } },
  ) => { error?: { details?: { message: string }[] } };
}

export const validateRequest = (schema: SchemaValidator) => {
  return async (
    req: FileRequest,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      const option = {
        abortEarly: false,
        errors: {
          wrap: { label: "" },
        },
      };

      const { error } = await schema.validate(req.body, option);

      if (error) throw error;

      next();
    } catch (error: unknown) {
      const { body, files } = req;

      if (Array.isArray(files)) {
        files.forEach((file) => {
          const fieldValue = body[file.fieldname];
          if (fieldValue && typeof fieldValue === "string") {
            removeFile(fieldValue);
          }
        });
      }

      const errorMsg =
        error instanceof Error ? error.message : "Validation failed";

      await errorRes(res, errorMsg);
    }
  };
};

import { IUser } from "../../model/model.users";

declare global {
  namespace Express {
    interface Request {
      user?: IUser & { _id: string };
      files?: {
        album?: Express.Multer.File[];
        thumbnail?: Express.Multer.File[];
      };
    }
  }
}

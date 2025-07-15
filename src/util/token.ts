import jwt from "jsonwebtoken";
import { Types } from "mongoose";

import { IUser } from "../api/model/model.users";

export const userToken = async (
  findCustomer: IUser | { _id: Types.ObjectId },
): Promise<string> => {
  if (!findCustomer || !findCustomer._id) {
    throw new Error("Invalid customer document");
  }

  const id = findCustomer._id.toString();
  const token = jwt.sign({ id }, process.env.TOKEN_KEY as string, {
    expiresIn: "24h",
  });

  return token;
};

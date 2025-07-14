import jwt from "jsonwebtoken";
import { Document } from "mongoose";

interface CustomerDocument extends Document {
  _id: string;
}

export const userToken = async (findCustomer: CustomerDocument) => {
  if (!findCustomer || !findCustomer._id) {
    throw new Error("Invalid customer document");
  }

  const token = jwt.sign(
    { id: findCustomer._id },
    process.env.TOKEN_KEY as string,
    { expiresIn: "24h" },
  );

  return token;
};

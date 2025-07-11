import jwt from "jsonwebtoken";

export const userToken = async (findCustomer: any) => {
  const data = jwt.sign(
    { id: findCustomer._id },
    process.env.TOKEN_KEY as string,
  );
  return data;
};

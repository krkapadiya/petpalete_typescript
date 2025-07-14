import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { Request, Response, NextFunction } from "express";
import { users, IUser } from "./../model/model.users";
import { user_sessions } from "./../model/model.user_sessions";
import { errorRes, authFailRes } from "./../../util/response_functions";
const TOKEN_KEY = process.env.TOKEN_KEY as string;
if (!TOKEN_KEY) {
  throw new Error("Missing TOKEN_KEY in environment variables");
}

interface DecodedToken extends JwtPayload {
  id: string;
}

interface AuthenticatedRequest extends Request {
  user?: IUser & {
    token?: string;
    is_blocked_by_admin: boolean;
  };
}

const getBearerToken = (authHeader?: string): string | null => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const parts = authHeader.split(" ");
  if (parts.length !== 2 || !parts[1]) return null;
  return parts[1];
};

const verifyToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const bearerToken = getBearerToken(req.headers["authorization"]);
    if (!bearerToken) {
      return void errorRes(res, "A token is required for authentication.");
    }

    const findUsersSession = await user_sessions.findOne({
      auth_token: bearerToken,
    });
    if (!findUsersSession) {
      return void authFailRes(res, "Authentication failed.");
    }

    const decoded = jwt.verify(bearerToken, TOKEN_KEY) as DecodedToken;
    if (!decoded.id) {
      return void authFailRes(res, "Invalid token payload.");
    }

    const findUsers = await users.findOne({
      _id: decoded.id,
      is_deleted: false,
    });
    if (!findUsers) {
      return void authFailRes(res, "Authentication failed.");
    }

    if (findUsers.is_blocked_by_admin === true) {
      return void authFailRes(
        res,
        "Your account has been blocked by the admin.",
      );
    }

    req.user = findUsers;
    req.user.token = bearerToken;
    next();
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "jwt malformed") {
      return void authFailRes(res, "Authentication failed.");
    }
    console.log("jwt::::::::::", error);
    return void errorRes(res, "Internal server error");
  }
};

const verifyTokenCreateProfile = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const bearerToken = getBearerToken(req.headers["authorization"]);
    if (!bearerToken) {
      return void errorRes(res, "A token is required for authentication.");
    }

    const decoded = jwt.verify(bearerToken, TOKEN_KEY) as DecodedToken;
    if (!decoded.id) {
      return void authFailRes(res, "Invalid token payload.");
    }

    const findUsers = await users.findOne({
      _id: decoded.id,
      is_deleted: false,
    });

    if (!findUsers) {
      return void authFailRes(res, "Authentication failed.");
    }

    if (findUsers.is_blocked_by_admin === true) {
      return void authFailRes(
        res,
        "Your account has been blocked by the admin.",
      );
    }

    req.user = findUsers;
    req.user.token = bearerToken;
    next();
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "jwt malformed") {
      return void authFailRes(res, "Authentication failed.");
    }
    console.log("jwt::::::::::", error);
    return void errorRes(res, "Internal server error");
  }
};

const verifyTokenLogout = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const bearerToken = getBearerToken(req.headers["authorization"]);
    if (!bearerToken) {
      return void errorRes(res, "A token is required for authentication.");
    }

    const findUsersSession = await user_sessions.findOne({
      auth_token: bearerToken,
    });

    if (!findUsersSession) {
      return void authFailRes(res, "Authentication failed.");
    }

    const decoded = jwt.verify(bearerToken, TOKEN_KEY) as DecodedToken;
    if (!decoded.id) {
      return void authFailRes(res, "Invalid token payload.");
    }

    const findUsers = await users.findOne({
      _id: decoded.id,
      is_deleted: false,
    });

    if (!findUsers) {
      return void authFailRes(res, "Authentication failed.");
    }

    req.user = findUsers;
    req.user.token = bearerToken;
    next();
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "jwt malformed") {
      return void authFailRes(res, "Authentication failed.");
    }
    console.log("jwt::::::::::", error);
    return void errorRes(res, "Internal server error");
  }
};

export const userAuth = verifyToken;
export const userAuthLogout = verifyTokenLogout;
export const userAuthCreateProfile = verifyTokenCreateProfile;

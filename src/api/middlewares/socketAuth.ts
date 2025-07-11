import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import { users } from "./../model/model.users";
import { user_sessions } from "./../model/model.user_sessions";

interface JwtPayload {
  id: string;
}

export const socketAuth = async (socket: any, next: any) => {
  try {
    const bearerHeader = socket.handshake.headers["authorization"];

    if (!bearerHeader) {
      return next(new Error("A token is required for authentication."));
    }

    const bearerToken = bearerHeader.startsWith("Bearer ")
      ? bearerHeader.split(" ")[1]
      : bearerHeader;

    const findUserSession = await user_sessions.find({
      auth_token: bearerToken,
    });

    if (!findUserSession) {
      return next(new Error("Authentication failed."));
    }

    const decoded = jwt.verify(
      bearerToken,
      process.env.TOKEN_KEY as string,
    ) as JwtPayload;
    const { id } = decoded;

    const findUser = await users.findOne({
      _id: id,
      is_deleted: false,
    });

    if (!findUser) {
      return next(new Error("Authentication failed."));
    }

    if (findUser.is_blocked_by_admin) {
      return next(new Error("Your account has been blocked by the admin."));
    }

    // Attach user info to socket
    socket.user = findUser;
    socket.user.token = bearerToken;

    next();
  } catch (error) {
    console.log(
      "Socket JWT Error:",
      error instanceof Error ? error.message : String(error),
    );
    return next(new Error("Authentication failed."));
  }
};

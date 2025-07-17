// socket-auth.ts
import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { users } from "../../api/model/model.users";
import { user_sessions } from "../../api/model/model.user_sessions";
import { IUser } from "../../api/model/model.users";

type IAuthenticatedUser = Omit<IUser, keyof Document> & { token: string };

export type AuthSocket = Socket & {
  user?: IAuthenticatedUser;
};

export const socketAuth = async (
  socket: AuthSocket,
  next: (err?: Error) => void,
): Promise<void> => {
  try {
    const bearerHeader = socket.handshake.headers.authorization as
      | string
      | undefined;

    if (!bearerHeader) {
      return next(new Error("A token is required for authentication."));
    }

    const bearerToken = bearerHeader.startsWith("Bearer ")
      ? bearerHeader.split(" ")[1]
      : bearerHeader;

    const activeSession = await user_sessions.findOne({
      auth_token: bearerToken,
    });
    if (!activeSession) {
      return next(new Error("Authentication failed."));
    }

    const { id } = jwt.verify(bearerToken, process.env.TOKEN_KEY as string) as {
      id: string;
    };

    const user = await users
      .findOne({ _id: id, is_deleted: false })
      .lean()
      .exec();

    if (!user) {
      return next(new Error("Authentication failed."));
    }

    const isBlocked =
      user.is_blocked_by_admin === true ||
      String(user.is_blocked_by_admin) === "true";

    if (isBlocked) {
      return next(new Error("Your account has been blocked by the admin."));
    }

    socket.user = {
      ...user,
      token: bearerToken,
    };

    next();
  } catch (err) {
    console.error("Socket JWT Error:", (err as Error).message);
    next(new Error("Authentication failed."));
  }
};

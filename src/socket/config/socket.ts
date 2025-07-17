// socket/config/socket.ts
import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";
import { Server as IOServer, Socket } from "socket.io";
import { IUser } from "../../api/model/model.users";

let ioInstance: IOServer | null = null;

const socket = {
  init(server: HttpServer | HttpsServer): IOServer {
    ioInstance = new IOServer(server, {
      cors: { origin: "*", methods: ["GET", "POST"] },
    });
    return ioInstance;
  },

  getIO(): IOServer {
    if (!ioInstance) {
      throw new Error("Socket.io not initialized!");
    }
    return ioInstance;
  },
};

export type SocketWithUser = Socket & {
  user?: IUser;
};

export default socket;

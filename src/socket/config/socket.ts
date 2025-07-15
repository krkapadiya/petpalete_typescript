import { Server as HTTPServer } from "http";
import { Server as HTTPSServer } from "https";
import { Server as SocketIOServer, Namespace } from "socket.io";

type ServerType = HTTPServer | HTTPSServer;

let ioInstance: SocketIOServer | null = null;

export const init = (server: ServerType): SocketIOServer => {
  ioInstance = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  return ioInstance;
};

export const getIO = (): SocketIOServer => {
  if (!ioInstance) {
    throw new Error("Socket.IO instance has not been initialised!");
  }
  return ioInstance;
};

export type SocketIONamespace = Namespace;

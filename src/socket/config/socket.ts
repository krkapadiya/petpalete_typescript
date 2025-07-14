// import { Server, Socket } from "socket.io";
// import { Server as HttpServer } from "http";

// export interface SocketUser {
//   _id: string;
//   [key: string]: unknown;
// }

// export interface SocketWithUser extends Socket {
//   user: SocketUser;
// }

// export interface ServerWithUser extends Server {
//   to(room: string): ServerWithUser;
//   emit(event: string, data: unknown): ServerWithUser;
// }

// let ioInstance: Server | null = null;

// export default {
//   init: (server: HttpServer) => {
//     ioInstance = new Server(server, {
//       cors: {
//         origin: "*",
//         methods: ["GET", "POST"],
//       },
//     });
//     return ioInstance;
//   },
//   getIO: () => {
//     if (!ioInstance) {
//       throw new Error("Socket.io not initialized!");
//     }
//     return ioInstance;
//   },
// };

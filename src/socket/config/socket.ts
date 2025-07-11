// socket.js
let ioInstance: any = null;

export default {
  init: (server: any) => {
    ioInstance = require("socket.io")(server, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    return ioInstance;
  },
  getIO: () => {
    if (!ioInstance) {
      throw new Error("Socket.io not initialized!");
    }
    return ioInstance;
  },
};

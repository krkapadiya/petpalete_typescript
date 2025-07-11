"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// socket.js
let ioInstance = null;
exports.default = {
    init: (server) => {
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

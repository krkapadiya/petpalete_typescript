"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIO = exports.init = void 0;
const socket_io_1 = require("socket.io");
let ioInstance = null;
const init = (server) => {
    ioInstance = new socket_io_1.Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
    });
    return ioInstance;
};
exports.init = init;
const getIO = () => {
    if (!ioInstance) {
        throw new Error("Socket.IO instance has not been initialised!");
    }
    return ioInstance;
};
exports.getIO = getIO;

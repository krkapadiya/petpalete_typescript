"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const socket_io_1 = require("socket.io");
let ioInstance = null;
const socket = {
    init(server) {
        ioInstance = new socket_io_1.Server(server, {
            cors: { origin: "*", methods: ["GET", "POST"] },
        });
        return ioInstance;
    },
    getIO() {
        if (!ioInstance) {
            throw new Error("Socket.io not initialized!");
        }
        return ioInstance;
    },
};
exports.default = socket;

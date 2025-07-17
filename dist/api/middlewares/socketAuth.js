"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const model_users_1 = require("../../api/model/model.users");
const model_user_sessions_1 = require("../../api/model/model.user_sessions");
const socketAuth = (socket, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bearerHeader = socket.handshake.headers.authorization;
        if (!bearerHeader) {
            return next(new Error("A token is required for authentication."));
        }
        const bearerToken = bearerHeader.startsWith("Bearer ")
            ? bearerHeader.split(" ")[1]
            : bearerHeader;
        const activeSession = yield model_user_sessions_1.user_sessions.findOne({
            auth_token: bearerToken,
        });
        if (!activeSession) {
            return next(new Error("Authentication failed."));
        }
        const { id } = jsonwebtoken_1.default.verify(bearerToken, process.env.TOKEN_KEY);
        const user = yield model_users_1.users
            .findOne({ _id: id, is_deleted: false })
            .lean()
            .exec();
        if (!user) {
            return next(new Error("Authentication failed."));
        }
        const isBlocked = user.is_blocked_by_admin === true ||
            String(user.is_blocked_by_admin) === "true";
        if (isBlocked) {
            return next(new Error("Your account has been blocked by the admin."));
        }
        socket.user = Object.assign(Object.assign({}, user), { token: bearerToken });
        next();
    }
    catch (err) {
        console.error("Socket JWT Error:", err.message);
        next(new Error("Authentication failed."));
    }
});
exports.socketAuth = socketAuth;

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
exports.userAuthCreateProfile = exports.userAuthLogout = exports.userAuth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const model_users_1 = require("./../model/model.users");
const model_user_sessions_1 = require("./../model/model.user_sessions");
const response_functions_1 = require("./../../util/response_functions");
const TOKEN_KEY = process.env.TOKEN_KEY;
if (!TOKEN_KEY) {
    throw new Error("Missing TOKEN_KEY in environment variables");
}
const getBearerToken = (authHeader) => {
    if (!authHeader || !authHeader.startsWith("Bearer "))
        return null;
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || !parts[1])
        return null;
    return parts[1];
};
const verifyToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bearerToken = getBearerToken(req.headers["authorization"]);
        if (!bearerToken) {
            return void (0, response_functions_1.errorRes)(res, "A token is required for authentication.");
        }
        const findUsersSession = yield model_user_sessions_1.user_sessions.findOne({
            auth_token: bearerToken,
        });
        if (!findUsersSession) {
            return void (0, response_functions_1.authFailRes)(res, "Authentication failed.");
        }
        const decoded = jsonwebtoken_1.default.verify(bearerToken, TOKEN_KEY);
        if (!decoded.id) {
            return void (0, response_functions_1.authFailRes)(res, "Invalid token payload.");
        }
        const findUsers = yield model_users_1.users.findOne({
            _id: decoded.id,
            is_deleted: false,
        });
        if (!findUsers) {
            return void (0, response_functions_1.authFailRes)(res, "Authentication failed.");
        }
        if (findUsers.is_blocked_by_admin === true) {
            return void (0, response_functions_1.authFailRes)(res, "Your account has been blocked by the admin.");
        }
        req.user = findUsers;
        req.user.token = bearerToken;
        next();
    }
    catch (error) {
        if (error instanceof Error && error.message === "jwt malformed") {
            return void (0, response_functions_1.authFailRes)(res, "Authentication failed.");
        }
        console.log("jwt::::::::::", error);
        return void (0, response_functions_1.errorRes)(res, "Internal server error");
    }
});
const verifyTokenCreateProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bearerToken = getBearerToken(req.headers["authorization"]);
        if (!bearerToken) {
            return void (0, response_functions_1.errorRes)(res, "A token is required for authentication.");
        }
        const decoded = jsonwebtoken_1.default.verify(bearerToken, TOKEN_KEY);
        if (!decoded.id) {
            return void (0, response_functions_1.authFailRes)(res, "Invalid token payload.");
        }
        const findUsers = yield model_users_1.users.findOne({
            _id: decoded.id,
            is_deleted: false,
        });
        if (!findUsers) {
            return void (0, response_functions_1.authFailRes)(res, "Authentication failed.");
        }
        if (findUsers.is_blocked_by_admin === true) {
            return void (0, response_functions_1.authFailRes)(res, "Your account has been blocked by the admin.");
        }
        req.user = findUsers;
        req.user.token = bearerToken;
        next();
    }
    catch (error) {
        if (error instanceof Error && error.message === "jwt malformed") {
            return void (0, response_functions_1.authFailRes)(res, "Authentication failed.");
        }
        console.log("jwt::::::::::", error);
        return void (0, response_functions_1.errorRes)(res, "Internal server error");
    }
});
const verifyTokenLogout = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const bearerToken = getBearerToken(req.headers["authorization"]);
        if (!bearerToken) {
            return void (0, response_functions_1.errorRes)(res, "A token is required for authentication.");
        }
        const findUsersSession = yield model_user_sessions_1.user_sessions.findOne({
            auth_token: bearerToken,
        });
        if (!findUsersSession) {
            return void (0, response_functions_1.authFailRes)(res, "Authentication failed.");
        }
        const decoded = jsonwebtoken_1.default.verify(bearerToken, TOKEN_KEY);
        if (!decoded.id) {
            return void (0, response_functions_1.authFailRes)(res, "Invalid token payload.");
        }
        const findUsers = yield model_users_1.users.findOne({
            _id: decoded.id,
            is_deleted: false,
        });
        if (!findUsers) {
            return void (0, response_functions_1.authFailRes)(res, "Authentication failed.");
        }
        req.user = findUsers;
        req.user.token = bearerToken;
        next();
    }
    catch (error) {
        if (error instanceof Error && error.message === "jwt malformed") {
            return void (0, response_functions_1.authFailRes)(res, "Authentication failed.");
        }
        console.log("jwt::::::::::", error);
        return void (0, response_functions_1.errorRes)(res, "Internal server error");
    }
});
exports.userAuth = verifyToken;
exports.userAuthLogout = verifyTokenLogout;
exports.userAuthCreateProfile = verifyTokenCreateProfile;

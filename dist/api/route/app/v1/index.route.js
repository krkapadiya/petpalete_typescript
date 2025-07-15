"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app_router = express_1.default.Router();
const app_version_route_1 = __importDefault(require("./app_version.route"));
const community_route_1 = __importDefault(require("./community.route"));
const user_route_1 = __importDefault(require("./user.route"));
const pet_route_1 = __importDefault(require("./pet.route"));
const service_route_1 = __importDefault(require("./service.route"));
app_router.use("/app_version", app_version_route_1.default);
app_router.use("/community", community_route_1.default);
app_router.use("/user", user_route_1.default);
app_router.use("/pet", pet_route_1.default);
app_router.use("/service", service_route_1.default);
exports.default = app_router;

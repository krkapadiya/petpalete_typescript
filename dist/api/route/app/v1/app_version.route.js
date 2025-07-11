"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app_router = express_1.default.Router();
const connect_multiparty_1 = __importDefault(require("connect-multiparty"));
const multipartMiddleware = (0, connect_multiparty_1.default)();
const validation_1 = require("../../../middlewares/validation");
const app_version_controller_1 = require("../../../controller/app/v1/app_version.controller");
const app_version_dto_1 = require("../../../dto/app/v1/app_version_dto");
app_router.post("/add_app_version", multipartMiddleware, (0, validation_1.validateRequest)(app_version_dto_1.addAppVersionDto), app_version_controller_1.addAppVersion);
app_router.post("/update_app_version", multipartMiddleware, (0, validation_1.validateRequest)(app_version_dto_1.appVersionCheckDto), app_version_controller_1.appVersionCheck);
exports.default = app_router;

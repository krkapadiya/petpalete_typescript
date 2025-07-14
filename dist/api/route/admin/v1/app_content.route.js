"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_router = express_1.default.Router();
const connect_multiparty_1 = __importDefault(require("connect-multiparty"));
const multipartMiddleware = (0, connect_multiparty_1.default)();
const auth_1 = require("../../../middlewares/auth");
const validation_1 = require("../../../middlewares/validation");
const app_content_controller_1 = require("../../../controller/admin/v1/app_content.controller");
const app_content_dto_1 = require("../../../dto/admin/v1/app_content_dto");
admin_router.post("/add_content", auth_1.userAuth, multipartMiddleware, (0, validation_1.validateRequest)(app_content_dto_1.addContentDto), app_content_controller_1.addContent);
admin_router.post("/edit_content", auth_1.userAuth, multipartMiddleware, (0, validation_1.validateRequest)(app_content_dto_1.editContentDto), app_content_controller_1.editContent);
admin_router.post("/delete_content", auth_1.userAuth, multipartMiddleware, (0, validation_1.validateRequest)(app_content_dto_1.deleteContentDto), app_content_controller_1.deleteContent);
admin_router.post("/get_content", auth_1.userAuth, multipartMiddleware, (0, validation_1.validateRequest)(app_content_dto_1.getContentDto), app_content_controller_1.getContent);
exports.default = admin_router;

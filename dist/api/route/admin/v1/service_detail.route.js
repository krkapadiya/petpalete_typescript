"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_router = express_1.default.Router();
const multipartMiddleware = require("connect-multiparty")();
const auth_1 = require("../../../middlewares/auth");
const validation_1 = require("../../../middlewares/validation");
const service_detail_controller_1 = require("./../../../controller/admin/v1/service_detail.controller");
const service_detail_dto_1 = require("../../../dto/admin/v1/service_detail_dto");
admin_router.post("/all_service_list", auth_1.userAuth, multipartMiddleware, (0, validation_1.validateRequest)(service_detail_dto_1.allServiceListDto), service_detail_controller_1.allServiceList);
admin_router.post("/service_detail", auth_1.userAuth, multipartMiddleware, (0, validation_1.validateRequest)(service_detail_dto_1.serviceDetailDto), service_detail_controller_1.serviceDetail);
admin_router.post("/service_favorites_user", auth_1.userAuth, multipartMiddleware, (0, validation_1.validateRequest)(service_detail_dto_1.serviceFavoritesUsersDto), service_detail_controller_1.serviceFavoritesUsers);
exports.default = admin_router;

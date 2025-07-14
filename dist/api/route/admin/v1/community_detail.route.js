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
const community_detail_controller_1 = require("./../../../controller/admin/v1/community_detail.controller");
const community_detail_dto_1 = require("../../../dto/admin/v1/community_detail_dto");
admin_router.post("/all_community_list", auth_1.userAuth, multipartMiddleware, (0, validation_1.validateRequest)(community_detail_dto_1.allCommunityListDto), community_detail_controller_1.allCommunityList);
admin_router.post("/community_detail", auth_1.userAuth, multipartMiddleware, (0, validation_1.validateRequest)(community_detail_dto_1.communityDetailDto), community_detail_controller_1.communityDetail);
exports.default = admin_router;

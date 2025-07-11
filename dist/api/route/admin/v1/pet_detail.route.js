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
const pet_detail_controller_1 = require("./../../../controller/admin/v1/pet_detail.controller");
const pet_detail_dto_1 = require("../../../dto/admin/v1/pet_detail_dto");
admin_router.post("/all_pet_list", auth_1.userAuth, multipartMiddleware, (0, validation_1.validateRequest)(pet_detail_dto_1.allPetListDto), pet_detail_controller_1.allPetList);
admin_router.post("/pet_detail", auth_1.userAuth, multipartMiddleware, (0, validation_1.validateRequest)(pet_detail_dto_1.petDetailDto), pet_detail_controller_1.petDetail);
admin_router.post("/pet_favorites_user", auth_1.userAuth, multipartMiddleware, (0, validation_1.validateRequest)(pet_detail_dto_1.petFavoritesUsersDto), pet_detail_controller_1.petFavoritesUsers);
exports.default = admin_router;

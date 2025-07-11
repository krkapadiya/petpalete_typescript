"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.petFavoritesUsersDto = exports.petDetailDto = exports.allPetListDto = void 0;
const joi_1 = __importDefault(require("joi"));
exports.allPetListDto = joi_1.default.object().keys({
    search: joi_1.default.string().allow().label("Search"),
    pet_type: joi_1.default.string().allow().label("Pet type"),
    pet_breed: joi_1.default.string().allow().label("Pet breed"),
    gender: joi_1.default.string().allow().label("gender"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    lat: joi_1.default.allow().label("Lat"),
    long: joi_1.default.allow().label("Long"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.petDetailDto = joi_1.default.object().keys({
    pet_id: joi_1.default.string().allow().label("Pet id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.petFavoritesUsersDto = joi_1.default.object().keys({
    pet_id: joi_1.default.string().allow().label("Pet id"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});

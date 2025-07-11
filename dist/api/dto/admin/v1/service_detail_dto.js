"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.serviceFavoritesUsersDto = exports.serviceDetailDto = exports.allServiceListDto = void 0;
const joi_1 = __importDefault(require("joi"));
exports.allServiceListDto = joi_1.default.object().keys({
    search: joi_1.default.string().allow().label("Search"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    lat: joi_1.default.allow().label("Lat"),
    long: joi_1.default.allow().label("Long"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.serviceDetailDto = joi_1.default.object().keys({
    service_id: joi_1.default.string().allow().label("Service id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.serviceFavoritesUsersDto = joi_1.default.object().keys({
    service_id: joi_1.default.string().allow().label("Service id"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});

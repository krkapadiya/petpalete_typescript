"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.communityDetailDto = exports.allCommunityListDto = void 0;
const joi_1 = __importDefault(require("joi"));
exports.allCommunityListDto = joi_1.default.object().keys({
    search: joi_1.default.string().allow().label("Search"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    lat: joi_1.default.allow().label("Lat"),
    long: joi_1.default.allow().label("Long"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.communityDetailDto = joi_1.default.object().keys({
    community_id: joi_1.default.string().allow().label("Community id"),
    ln: joi_1.default.string().allow().label("Ln"),
});

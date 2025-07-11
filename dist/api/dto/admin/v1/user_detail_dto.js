"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.allPaymentsDto = exports.paymentListDto = exports.userReviewsDto = exports.userCommunitiesDto = exports.userServiceFavoritesDto = exports.userServicesDto = exports.userPetFavoritesDto = exports.userPetsDto = exports.blockUnblockUserDto = exports.userDetailsDto = exports.allUserListDto = void 0;
const joi_1 = __importDefault(require("joi"));
exports.allUserListDto = joi_1.default.object().keys({
    search: joi_1.default.string().allow("").label("Search"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.userDetailsDto = joi_1.default.object().keys({
    user_id: joi_1.default.string().allow().label("User id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.blockUnblockUserDto = joi_1.default.object().keys({
    block_user_id: joi_1.default.string().allow().label("Block user ID"),
    is_block: joi_1.default.string().allow().label("Is block"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.userPetsDto = joi_1.default.object().keys({
    profile_user_id: joi_1.default.string().allow().label("Profile user id"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.userPetFavoritesDto = joi_1.default.object().keys({
    user_id: joi_1.default.string().allow().label("User id"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.userServicesDto = joi_1.default.object().keys({
    profile_user_id: joi_1.default.string().allow().label("Profile user id"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.userServiceFavoritesDto = joi_1.default.object().keys({
    user_id: joi_1.default.string().allow().label("User id"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.userCommunitiesDto = joi_1.default.object().keys({
    profile_user_id: joi_1.default.string().allow().label("Profile user id"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.userReviewsDto = joi_1.default.object().keys({
    reviewed_user_id: joi_1.default.string().allow().label("Reviewed user id"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.paymentListDto = joi_1.default.object().keys({
    user_id: joi_1.default.string().allow().label("User id"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.allPaymentsDto = joi_1.default.object().keys({
    search: joi_1.default.string().allow("").label("Search"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    fromDate: joi_1.default.allow().label("From date"),
    toDate: joi_1.default.allow().label("To date"),
    ln: joi_1.default.string().allow().label("Ln"),
});

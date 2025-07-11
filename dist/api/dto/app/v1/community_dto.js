"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userCommunityListingDto = exports.guestCommunityListingDto = exports.communityListingDto = exports.communityUpdatedDataDto = exports.communityDetailsDto = exports.removeCommunityMediaDto = exports.uploadCommunityMediaDto = exports.deleteCommunityDto = exports.editCommunityDto = exports.addCommunityDto = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addCommunityDto = joi_1.default.object().keys({
    title: joi_1.default.string().allow().label("Title name"),
    location: joi_1.default.string().allow().label("Location"),
    address: joi_1.default.string().allow().label("Address"),
    description: joi_1.default.string().allow().label("Description"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.editCommunityDto = joi_1.default.object().keys({
    community_id: joi_1.default.string().allow().label("Community id"),
    title: joi_1.default.string().allow().label("Title name"),
    location: joi_1.default.string().allow().label("Location"),
    address: joi_1.default.string().allow().label("Address"),
    description: joi_1.default.string().allow().label("Description"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.deleteCommunityDto = joi_1.default.object().keys({
    community_id: joi_1.default.string().allow().label("Community id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.uploadCommunityMediaDto = joi_1.default.object().keys({
    community_id: joi_1.default.string().allow().label("Community id"),
    album_type: joi_1.default.allow().label("Album type"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.removeCommunityMediaDto = joi_1.default.object().keys({
    album_id: joi_1.default.string().allow().label("Album id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.communityDetailsDto = joi_1.default.object().keys({
    community_id: joi_1.default.string().allow().label("Community id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.communityUpdatedDataDto = joi_1.default.object().keys({
    community_id: joi_1.default.string().allow().label("Community id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.communityListingDto = joi_1.default.object().keys({
    search: joi_1.default.string().allow().label("Search"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    lat: joi_1.default.allow().label("Lat"),
    long: joi_1.default.allow().label("Long"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.guestCommunityListingDto = joi_1.default.object().keys({
    search: joi_1.default.string().allow().label("Search"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    lat: joi_1.default.allow().label("Lat"),
    long: joi_1.default.allow().label("Long"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.userCommunityListingDto = joi_1.default.object().keys({
    profile_user_id: joi_1.default.string().allow().label("Profile user id"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});

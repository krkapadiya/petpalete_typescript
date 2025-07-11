"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userServiceListingDto = exports.serviceFavoriteListDto = exports.guestServiceListingDto = exports.serviceListingDto = exports.serviceUpdatedDataDto = exports.guestServiceDetailsDto = exports.serviceDetailsDto = exports.removeServiceMediaDto = exports.uploadServiceMediaDto = exports.likeDislikeServicesDto = exports.deleteServiceDto = exports.editServiceDto = exports.addServiceDto = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addServiceDto = joi_1.default.object().keys({
    service_name: joi_1.default.string().allow().label("Service name"),
    location: joi_1.default.string().allow().label("Location"),
    address: joi_1.default.string().allow().label("Address"),
    price: joi_1.default.string().allow().label("Price"),
    description: joi_1.default.string().allow().label("Description"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.editServiceDto = joi_1.default.object().keys({
    service_id: joi_1.default.string().allow().label("Service id"),
    service_name: joi_1.default.string().allow().label("Service name"),
    location: joi_1.default.string().allow().label("Location"),
    address: joi_1.default.string().allow().label("Address"),
    price: joi_1.default.string().allow().label("Price"),
    description: joi_1.default.string().allow().label("Description"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.deleteServiceDto = joi_1.default.object().keys({
    service_id: joi_1.default.string().allow().label("Service id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.likeDislikeServicesDto = joi_1.default.object().keys({
    service_id: joi_1.default.string().allow().label("Service id"),
    is_like: joi_1.default.string().allow().label("Is like"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.uploadServiceMediaDto = joi_1.default.object().keys({
    service_id: joi_1.default.string().allow().label("Service id"),
    album_type: joi_1.default.allow().label("Album type"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.removeServiceMediaDto = joi_1.default.object().keys({
    album_id: joi_1.default.string().allow().label("Album id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.serviceDetailsDto = joi_1.default.object().keys({
    service_id: joi_1.default.string().allow().label("Service id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.guestServiceDetailsDto = joi_1.default.object().keys({
    service_id: joi_1.default.string().allow().label("Service id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.serviceUpdatedDataDto = joi_1.default.object().keys({
    service_id: joi_1.default.string().allow().label("Service id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.serviceListingDto = joi_1.default.object().keys({
    search: joi_1.default.string().allow().label("Search"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    lat: joi_1.default.allow().label("Lat"),
    long: joi_1.default.allow().label("Long"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.guestServiceListingDto = joi_1.default.object().keys({
    search: joi_1.default.string().allow().label("Search"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    lat: joi_1.default.allow().label("Lat"),
    long: joi_1.default.allow().label("Long"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.serviceFavoriteListDto = joi_1.default.object().keys({
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.userServiceListingDto = joi_1.default.object().keys({
    profile_user_id: joi_1.default.string().allow().label("Profile user id"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});

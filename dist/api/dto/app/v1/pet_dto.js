"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.guestUserPetListingDto = exports.userPetListingDto = exports.petFavoriteListDto = exports.guestPetListingDto = exports.petListingDto = exports.petUpdatedDataDto = exports.guestPetDetailsDto = exports.petDetailsDto = exports.removePetMediaDto = exports.uploadPetMediaDto = exports.likeDislikePetsDto = exports.adoptPetDto = exports.deletePetDto = exports.editPetDto = exports.addPetDto = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addPetDto = joi_1.default.object().keys({
    pet_name: joi_1.default.string().allow().label("Pet name"),
    pet_type: joi_1.default.string().allow().label("Pet type"),
    pet_breed: joi_1.default.string().allow().label("Pet breed"),
    location: joi_1.default.string().allow().label("Location"),
    address: joi_1.default.string().allow().label("Address"),
    gender: joi_1.default.string().allow().label("Gender"),
    price: joi_1.default.string().allow().label("Price"),
    description: joi_1.default.string().allow().label("Description"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.editPetDto = joi_1.default.object().keys({
    pet_id: joi_1.default.string().allow().label("Pet id"),
    pet_name: joi_1.default.string().allow().label("Pet name"),
    pet_type: joi_1.default.string().allow().label("Pet type"),
    pet_breed: joi_1.default.string().allow().label("Pet breed"),
    location: joi_1.default.string().allow().label("Location"),
    address: joi_1.default.string().allow().label("Address"),
    gender: joi_1.default.string().allow().label("Gender"),
    price: joi_1.default.string().allow().label("Price"),
    description: joi_1.default.string().allow().label("Description"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.deletePetDto = joi_1.default.object().keys({
    pet_id: joi_1.default.string().allow().label("Pet id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.adoptPetDto = joi_1.default.object().keys({
    pet_id: joi_1.default.string().allow().label("Pet id"),
    is_adopted: joi_1.default.string().allow().label("Is adopted"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.likeDislikePetsDto = joi_1.default.object().keys({
    pet_id: joi_1.default.string().allow().label("Pet id"),
    is_like: joi_1.default.string().allow().label("Is like"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.uploadPetMediaDto = joi_1.default.object().keys({
    pet_id: joi_1.default.string().allow().label("Pet id"),
    album_type: joi_1.default.allow().label("Album type"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.removePetMediaDto = joi_1.default.object().keys({
    album_id: joi_1.default.string().allow().label("Album id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.petDetailsDto = joi_1.default.object().keys({
    pet_id: joi_1.default.string().allow().label("Pet id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.guestPetDetailsDto = joi_1.default.object().keys({
    pet_id: joi_1.default.string().allow().label("Pet id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.petUpdatedDataDto = joi_1.default.object().keys({
    pet_id: joi_1.default.string().allow().label("Pet id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.petListingDto = joi_1.default.object().keys({
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
exports.guestPetListingDto = joi_1.default.object().keys({
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
exports.petFavoriteListDto = joi_1.default.object().keys({
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.userPetListingDto = joi_1.default.object().keys({
    profile_user_id: joi_1.default.string().allow().label("Profile user id"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.guestUserPetListingDto = joi_1.default.object().keys({
    profile_user_id: joi_1.default.string().allow().label("Profile user id"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});

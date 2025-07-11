"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.petFavoritesUsers = exports.petDetail = exports.allPetList = void 0;
const i18n_1 = __importDefault(require("i18n"));
const model_pets_1 = require("./../../../model/model.pets");
const model_pet_likes_1 = require("./../../../model/model.pet_likes");
const response_functions_1 = require("./../../../../util/response_functions");
const user_function_1 = require("./../../../../util/user_function");
const allPetList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "", pet_type, pet_breed, gender, page = 1, limit = 10, lat, long, miles_distance = 100, ln, } = req.body;
        i18n_1.default.setLocale(req, ln);
        const escapedSearch = search ? yield (0, user_function_1.escapeRegex)(search) : null;
        const query = {
            is_deleted: false,
        };
        if (lat && long) {
            const earthRadiusInMiles = 3963.2;
            const distanceInMiles = parseInt(miles_distance);
            const lat1 = parseFloat(lat);
            const long1 = parseFloat(long);
            const radians = distanceInMiles / earthRadiusInMiles;
            const minLat = lat1 - radians * (180 / Math.PI);
            const maxLat = lat1 + radians * (180 / Math.PI);
            const minLong = long1 - (radians * (180 / Math.PI)) / Math.cos((lat1 * Math.PI) / 180);
            const maxLong = long1 + (radians * (180 / Math.PI)) / Math.cos((lat1 * Math.PI) / 180);
            query.location = {
                $geoWithin: {
                    $geometry: {
                        type: "Polygon",
                        coordinates: [
                            [
                                [minLong, minLat],
                                [maxLong, minLat],
                                [maxLong, maxLat],
                                [minLong, maxLat],
                                [minLong, minLat], // closed polygon
                            ],
                        ],
                    },
                },
            };
        }
        let petType = [];
        let petBreed = [];
        let petGender = [];
        if (pet_type) {
            petType = JSON.parse(pet_type);
            query.pet_type = { $in: petType };
        }
        if (pet_breed) {
            petBreed = JSON.parse(pet_breed);
            query.pet_breed = { $in: petBreed };
        }
        if (gender) {
            petGender = JSON.parse(gender);
            query.gender = { $in: petGender };
        }
        if (escapedSearch) {
            query.$or = [
                { pet_name: { $regex: escapedSearch, $options: "i" } },
                { pet_type: { $regex: escapedSearch, $options: "i" } },
                { pet_breed: { $regex: escapedSearch, $options: "i" } },
                { gender: { $regex: escapedSearch, $options: "i" } },
                { description: { $regex: escapedSearch, $options: "i" } },
            ];
        }
        const total_pets = yield model_pets_1.pets.countDocuments(query);
        const pet_list = yield model_pets_1.pets.aggregate([
            { $match: query },
            { $sort: { createdAt: -1 } },
            { $skip: (parseInt(page) - 1) * parseInt(limit) },
            { $limit: parseInt(limit) },
            {
                $lookup: {
                    from: "pet_albums",
                    let: { petId: "$_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$pet_id", "$$petId"] },
                            },
                        },
                    ],
                    as: "pet_album",
                },
            },
            {
                $addFields: {
                    pet_media: {
                        $cond: {
                            if: { $gt: [{ $size: "$pet_album" }, 0] },
                            then: {
                                $cond: {
                                    if: {
                                        $eq: [
                                            { $arrayElemAt: ["$pet_album.album_type", 0] },
                                            "image",
                                        ],
                                    },
                                    then: {
                                        $concat: [
                                            process.env.BUCKET_URL,
                                            { $arrayElemAt: ["$pet_album.album_path", 0] },
                                        ],
                                    },
                                    else: {
                                        $concat: [
                                            process.env.BUCKET_URL,
                                            { $arrayElemAt: ["$pet_album.album_thumbnail", 0] },
                                        ],
                                    },
                                },
                            },
                            else: null,
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    pet_name: 1,
                    pet_type: 1,
                    pet_breed: 1,
                    location: 1,
                    address: 1,
                    gender: 1,
                    price: 1,
                    description: 1,
                    is_adopted: 1,
                    is_deleted: 1,
                    pet_media: 1,
                },
            },
        ]);
        yield (0, response_functions_1.multiSuccessRes)(res, res.__("Pets list get successfully."), total_pets, pet_list);
    }
    catch (error) {
        console.error("Error:", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
    }
});
exports.allPetList = allPetList;
const petDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pet_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_pet = yield (0, user_function_1.findPet)(pet_id);
        if (!find_pet) {
            yield (0, response_functions_1.errorRes)(res, res.__("Pet not found."));
            return;
        }
        const petObjectId = yield (0, user_function_1.objectId)(pet_id);
        const pet_detail = yield model_pets_1.pets.aggregate([
            {
                $match: {
                    _id: petObjectId,
                    is_deleted: false,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_details",
                },
            },
            {
                $unwind: {
                    path: "$user_details",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "user_albums",
                    let: { localId: "$user_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", "$$localId"] },
                                        { $eq: ["$album_type", "image"] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "user_media",
                },
            },
            {
                $lookup: {
                    from: "pet_albums",
                    let: {
                        petId: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ["$pet_id", "$$petId"] }],
                                },
                            },
                        },
                    ],
                    as: "pet_album",
                },
            },
            {
                $addFields: {
                    user_profile: {
                        $cond: {
                            if: { $gt: [{ $size: "$user_media" }, 0] },
                            then: {
                                $concat: [
                                    process.env.BUCKET_URL,
                                    { $arrayElemAt: ["$user_media.album_path", 0] },
                                ],
                            },
                            else: null,
                        },
                    },
                    pet_media: {
                        $map: {
                            input: "$pet_album",
                            as: "media",
                            in: {
                                _id: "$$media._id",
                                album_type: "$$media.album_type",
                                album_path: {
                                    $concat: [process.env.BUCKET_URL, "$$media.album_path"],
                                },
                                album_thumbnail: {
                                    $cond: {
                                        if: { $eq: ["$$media.album_thumbnail", null] },
                                        then: null,
                                        else: {
                                            $concat: [
                                                process.env.BUCKET_URL,
                                                "$$media.album_thumbnail",
                                            ],
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    pet_name: 1,
                    pet_type: 1,
                    pet_breed: 1,
                    location: 1,
                    address: 1,
                    gender: 1,
                    price: 1,
                    description: 1,
                    is_adopted: 1,
                    is_deleted: 1,
                    pet_media: 1,
                    user_profile: 1,
                    full_name: "$user_details.full_name",
                    createdAt: "$user_details.createdAt",
                },
            },
        ]);
        yield (0, response_functions_1.successRes)(res, res.__("Pet detail get successfully."), pet_detail);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.petDetail = petDetail;
const petFavoritesUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pet_id, page = 1, limit = 10, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const petObjectId = yield (0, user_function_1.objectId)(pet_id);
        const total_users = yield model_pet_likes_1.pet_likes.countDocuments({
            pet_id: petObjectId,
        });
        const user_list = yield model_pet_likes_1.pet_likes.aggregate([
            {
                $match: {
                    pet_id: petObjectId,
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $skip: (parseInt(page) - 1) * parseInt(limit),
            },
            {
                $limit: parseInt(limit),
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_details",
                },
            },
            {
                $unwind: {
                    path: "$user_details",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "user_albums",
                    let: { localId: "$user_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", "$$localId"] },
                                        { $eq: ["$album_type", "image"] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "user_media",
                },
            },
            {
                $addFields: {
                    user_profile: {
                        $cond: {
                            if: { $gt: [{ $size: "$user_media" }, 0] },
                            then: {
                                $concat: [
                                    process.env.BUCKET_URL,
                                    { $arrayElemAt: ["$user_media.album_path", 0] },
                                ],
                            },
                            else: null,
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    user_id: "$user_details.user_id",
                    full_name: "$user_details.full_name",
                    user_profile: 1,
                },
            },
        ]);
        yield (0, response_functions_1.multiSuccessRes)(res, res.__("Pet favorites user list get successfully."), total_users, user_list);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.petFavoritesUsers = petFavoritesUsers;

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
exports.serviceFavoritesUsers = exports.serviceDetail = exports.allServiceList = void 0;
const i18n_1 = __importDefault(require("i18n"));
const model_services_1 = require("./../../../model/model.services");
const model_service_likes_1 = require("./../../../model/model.service_likes");
const response_functions_1 = require("../../../../util/response_functions");
const user_function_1 = require("./../../../../util/user_function");
const allServiceList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "", page = 1, limit = 10, lat, long, miles_distance = 100, ln, } = req.body;
        i18n_1.default.setLocale(req, ln);
        const escapedSearch = search ? yield (0, user_function_1.escapeRegex)(search) : null;
        let query = {
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
                            // [
                            //     [minLat, minLong],
                            //     [minLat, maxLong],
                            //     [maxLat, maxLong],
                            //     [maxLat, minLong],
                            //     [minLat, minLong],
                            // ],
                            [
                                [minLong, minLat],
                                [maxLong, minLat],
                                [maxLong, maxLat],
                                [minLong, maxLat],
                                [minLong, minLat],
                            ],
                        ],
                    },
                },
            };
        }
        if (escapedSearch) {
            query.$or = [
                { service_name: { $regex: escapedSearch, $options: "i" } },
                { description: { $regex: escapedSearch, $options: "i" } },
            ];
        }
        const total_services = yield model_services_1.services.countDocuments(query);
        const service_list = yield model_services_1.services.aggregate([
            {
                $match: query,
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
                    from: "service_albums",
                    let: {
                        serviceId: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ["$service_id", "$$serviceId"] }],
                                },
                            },
                        },
                    ],
                    as: "service_album",
                },
            },
            {
                $addFields: {
                    service_media: {
                        $cond: {
                            if: { $gt: [{ $size: "$service_album" }, 0] },
                            then: {
                                $cond: {
                                    if: {
                                        $eq: [
                                            { $arrayElemAt: ["$service_album.album_type", 0] },
                                            "image",
                                        ],
                                    },
                                    then: {
                                        $concat: [
                                            process.env.BUCKET_URL,
                                            { $arrayElemAt: ["$service_album.album_path", 0] },
                                        ],
                                    },
                                    else: {
                                        $concat: [
                                            process.env.BUCKET_URL,
                                            { $arrayElemAt: ["$service_album.album_thumbnail", 0] },
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
                    service_name: 1,
                    location: 1,
                    address: 1,
                    price: 1,
                    description: 1,
                    is_deleted: 1,
                    service_media: 1,
                },
            },
        ]);
        yield (0, response_functions_1.multiSuccessRes)(res, res.__("Services list get successfully."), total_services, service_list);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.allServiceList = allServiceList;
const serviceDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { service_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_service = yield (0, user_function_1.findService)(service_id);
        if (!find_service) {
            yield (0, response_functions_1.errorRes)(res, res.__("Service not found."));
            return;
        }
        const serviceObjectId = yield (0, user_function_1.objectId)(service_id);
        const service_detail = yield model_services_1.services.aggregate([
            {
                $match: {
                    _id: serviceObjectId,
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
                    from: "service_albums",
                    let: {
                        serviceId: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ["$service_id", "$$serviceId"] }],
                                },
                            },
                        },
                    ],
                    as: "service_album",
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
                    service_media: {
                        $map: {
                            input: "$service_album",
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
                    service_name: 1,
                    location: 1,
                    address: 1,
                    price: 1,
                    description: 1,
                    is_deleted: 1,
                    service_media: 1,
                    user_profile: 1,
                    full_name: "$user_details.full_name",
                    createdAt: "$user_details.createdAt",
                },
            },
        ]);
        yield (0, response_functions_1.successRes)(res, res.__("Service detail get successfully."), service_detail);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.serviceDetail = serviceDetail;
const serviceFavoritesUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { service_id, page = 1, limit = 10, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const serviceObjectId = yield (0, user_function_1.objectId)(service_id);
        const total_users = yield model_service_likes_1.service_likes.countDocuments({
            service_id: serviceObjectId,
        });
        const user_list = yield model_service_likes_1.service_likes.aggregate([
            {
                $match: {
                    service_id: serviceObjectId,
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
        yield (0, response_functions_1.multiSuccessRes)(res, res.__("Service favorites user list get successfully."), total_users, user_list);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.serviceFavoritesUsers = serviceFavoritesUsers;

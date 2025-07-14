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
Object.defineProperty(exports, "__esModule", { value: true });
exports.allPayments = exports.paymentList = exports.userReviews = exports.userCommunities = exports.userServiceFavorites = exports.userServices = exports.userPetFavorites = exports.userPets = exports.blockUnblockUser = exports.userDetails = exports.allUserList = void 0;
const model_users_1 = require("./../../../model/model.users");
const model_pets_1 = require("./../../../model/model.pets");
const model_services_1 = require("./../../../model/model.services");
const model_pet_likes_1 = require("./../../../model/model.pet_likes");
const model_service_likes_1 = require("./../../../model/model.service_likes");
const model_communities_1 = require("./../../../model/model.communities");
const model_user_reviews_1 = require("./../../../model/model.user_reviews");
const model_payments_1 = require("./../../../model/model.payments");
const response_functions_1 = require("./../../../../util/response_functions");
const user_function_1 = require("./../../../../util/user_function");
const allUserList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { search = "", page = 1, limit = 10, ln } = req.body;
        i18n.setLocale(req, ln);
        const escapedSearch = search ? yield (0, user_function_1.escapeRegex)(search) : null;
        const users_data = yield model_users_1.users.aggregate([
            {
                $match: {
                    user_type: "user",
                    is_deleted: false,
                },
            },
            {
                $addFields: {
                    mobile_no: { $toString: "$mobile_number" },
                },
            },
            {
                $match: escapedSearch
                    ? {
                        $or: [
                            { full_name: { $regex: escapedSearch, $options: "i" } },
                            { email_address: { $regex: escapedSearch, $options: "i" } },
                            { mobile_no: { $regex: escapedSearch, $options: "i" } },
                            { address: { $regex: escapedSearch, $options: "i" } },
                        ],
                    }
                    : {},
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $skip: (parseInt(page) - 1) * parseInt(limit),
            },
            {
                $limit: parseInt(limit),
            },
            {
                $lookup: {
                    from: "user_albums",
                    let: { localId: "$_id" },
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
                    user_type: 1,
                    full_name: 1,
                    email_address: 1,
                    mobile_number: 1,
                    country_code: 1,
                    country_string_code: 1,
                    is_social_login: 1,
                    social_id: 1,
                    social_platform: 1,
                    notification_badge: 1,
                    user_profile: 1,
                    location: 1,
                    address: {
                        $cond: {
                            if: {
                                $ne: [
                                    {
                                        $type: "$address",
                                    },
                                    "missing",
                                ],
                            },
                            then: "$address",
                            else: null,
                        },
                    },
                    is_user_verified: 1,
                    is_blocked_by_admin: 1,
                    is_deleted: 1,
                },
            },
        ]);
        const users_data_count = yield model_users_1.users.aggregate([
            {
                $match: {
                    user_type: "user",
                    is_deleted: false,
                },
            },
            {
                $addFields: {
                    mobile_no: { $toString: "$mobile_number" },
                },
            },
            {
                $match: escapedSearch
                    ? {
                        $or: [
                            { full_name: { $regex: escapedSearch, $options: "i" } },
                            { email_address: { $regex: escapedSearch, $options: "i" } },
                            { mobile_no: { $regex: escapedSearch, $options: "i" } },
                            { address: { $regex: escapedSearch, $options: "i" } },
                        ],
                    }
                    : {},
            },
            {
                $project: {
                    _id: 1,
                },
            },
        ]);
        yield (0, response_functions_1.multiSuccessRes)(res, res.__("User list retrieved successfully."), users_data_count.length, users_data);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.allUserList = allUserList;
const userDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { user_id, ln } = req.body;
        i18n.setLocale(req, ln);
        const userObjectId = yield (0, user_function_1.objectId)(user_id);
        const [find_user_data] = yield model_users_1.users.aggregate([
            {
                $match: {
                    _id: userObjectId,
                    is_deleted: false,
                },
            },
            {
                $lookup: {
                    from: "user_albums",
                    let: { localId: "$_id" },
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
                    user_type: 1,
                    full_name: 1,
                    email_address: 1,
                    mobile_number: 1,
                    country_code: 1,
                    country_string_code: 1,
                    is_social_login: 1,
                    social_id: 1,
                    social_platform: 1,
                    notification_badge: 1,
                    user_profile: 1,
                    location: 1,
                    address: {
                        $cond: {
                            if: {
                                $ne: [
                                    {
                                        $type: "$address",
                                    },
                                    "missing",
                                ],
                            },
                            then: "$address",
                            else: null,
                        },
                    },
                    is_user_verified: 1,
                    is_blocked_by_admin: 1,
                    is_deleted: 1,
                },
            },
        ]);
        yield (0, response_functions_1.successRes)(res, res.__("User details retrieved successfully."), find_user_data);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.userDetails = userDetails;
const blockUnblockUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { block_user_id, is_block, ln } = req.body;
        i18n.setLocale(req, ln);
        let find_user = yield (0, user_function_1.findUser)(block_user_id);
        if (!find_user) {
            yield (0, response_functions_1.errorRes)(res, res.__("User not found."));
            return;
        }
        if (is_block == true || is_block == "true") {
            let find_block = yield (0, user_function_1.findBlockUser)(block_user_id);
            if (find_block) {
                yield (0, response_functions_1.successRes)(res, "User has been successfully blocked.", []);
                return;
            }
            yield model_users_1.users.updateOne({
                _id: block_user_id,
            }, {
                $set: {
                    is_blocked_by_admin: true,
                },
            });
            yield (0, response_functions_1.successRes)(res, res.__("User has been successfully blocked."), []);
            return;
        }
        yield model_users_1.users.updateOne({
            _id: block_user_id,
        }, {
            $set: {
                is_blocked_by_admin: false,
            },
        });
        yield (0, response_functions_1.successRes)(res, res.__("User has been successfully unblocked."), []);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.blockUnblockUser = blockUnblockUser;
const userPets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { profile_user_id, page = 1, limit = 10, ln } = req.body;
        i18n.setLocale(req, ln);
        const profileObjectId = yield (0, user_function_1.objectId)(profile_user_id);
        const query = {
            is_deleted: false,
            user_id: profileObjectId,
        };
        const total_pets = yield model_pets_1.pets.countDocuments(query);
        const pet_list = yield model_pets_1.pets.aggregate([
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
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.userPets = userPets;
const userPetFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, page = 1, limit = 10, ln } = req.body;
        i18n.setLocale(req, ln);
        const userObjectId = yield (0, user_function_1.objectId)(user_id);
        const total_pets = yield model_pet_likes_1.pet_likes.countDocuments({
            user_id: userObjectId,
        });
        const pet_list = yield model_pet_likes_1.pet_likes.aggregate([
            {
                $match: {
                    user_id: userObjectId,
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
                    from: "pets",
                    let: { localId: "$pet_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ["$_id", "$$localId"] }],
                                },
                            },
                        },
                    ],
                    as: "pet_detail",
                },
            },
            {
                $unwind: {
                    path: "$pet_detail",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "pet_albums",
                    let: {
                        petId: "$pet_id",
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
                    _id: "$pet_detail._id",
                    user_id: "$pet_detail.user_id",
                    pet_name: "$pet_detail.pet_name",
                    pet_type: "$pet_detail.pet_type",
                    pet_breed: "$pet_detail.pet_breed",
                    location: "$pet_detail.location",
                    address: "$pet_detail.address",
                    gender: "$pet_detail.gender",
                    price: "$pet_detail.price",
                    description: "$pet_detail.description",
                    is_adopted: "$pet_detail.is_adopted",
                    is_deleted: "$pet_detail.is_deleted",
                    pet_media: 1,
                },
            },
        ]);
        yield (0, response_functions_1.multiSuccessRes)(res, res.__("Pet favorites list get successfully."), total_pets, pet_list);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.userPetFavorites = userPetFavorites;
const userServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { profile_user_id, page = 1, limit = 10, ln } = req.body;
        i18n.setLocale(req, ln);
        const profileObjectId = yield (0, user_function_1.objectId)(profile_user_id);
        const query = {
            is_deleted: false,
            user_id: profileObjectId,
        };
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
exports.userServices = userServices;
const userServiceFavorites = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, page = 1, limit = 10, ln } = req.body;
        i18n.setLocale(req, ln);
        const userObjectId = yield (0, user_function_1.objectId)(user_id);
        const total_services = yield model_service_likes_1.service_likes.countDocuments({
            user_id: userObjectId,
        });
        const service_list = yield model_service_likes_1.service_likes.aggregate([
            {
                $match: {
                    user_id: userObjectId,
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
                    from: "services",
                    let: { localId: "$service_id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ["$_id", "$$localId"] }],
                                },
                            },
                        },
                    ],
                    as: "service_detail",
                },
            },
            {
                $unwind: {
                    path: "$service_detail",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "service_albums",
                    let: {
                        serviceId: "$service_id",
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
                    _id: "$service_detail._id",
                    user_id: "$service_detail.user_id",
                    service_name: "$service_detail.service_name",
                    location: "$service_detail.location",
                    address: "$service_detail.address",
                    price: "$service_detail.price",
                    description: "$service_detail.description",
                    is_deleted: "$service_detail.is_deleted",
                    service_media: 1,
                },
            },
        ]);
        yield (0, response_functions_1.multiSuccessRes)(res, res.__("Service favorites list get successfully."), total_services, service_list);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.userServiceFavorites = userServiceFavorites;
const userCommunities = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { profile_user_id, page = 1, limit = 10, ln } = req.body;
        i18n.setLocale(req, ln);
        const profileObjectId = yield (0, user_function_1.objectId)(profile_user_id);
        const query = {
            is_deleted: false,
            user_id: profileObjectId,
        };
        const total_communities = yield model_communities_1.communities.countDocuments(query);
        const communities_list = yield model_communities_1.communities.aggregate([
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
                    from: "communities_albums",
                    let: {
                        communityId: "$_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ["$community_id", "$$communityId"] }],
                                },
                            },
                        },
                    ],
                    as: "communities_album",
                },
            },
            {
                $addFields: {
                    communities_media: {
                        $map: {
                            input: "$communities_album",
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
                    title: 1,
                    location: 1,
                    address: 1,
                    description: 1,
                    is_deleted: 1,
                    communities_media: 1,
                },
            },
        ]);
        yield (0, response_functions_1.multiSuccessRes)(res, res.__("Communities list get successfully."), total_communities, communities_list);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.userCommunities = userCommunities;
const userReviews = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reviewed_user_id, page = 1, limit = 10, ln } = req.body;
        i18n.setLocale(req, ln);
        const reviewObjectId = yield (0, user_function_1.objectId)(reviewed_user_id);
        const result = yield model_user_reviews_1.user_reviews.aggregate([
            {
                $match: { reviewed_user_id: reviewObjectId },
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
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $skip: (parseInt(page) - 1) * parseInt(limit),
            },
            {
                $limit: parseInt(limit),
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
                    user_id: 1,
                    user_profile: 1,
                    full_name: "$user_details.full_name",
                    rating: {
                        $toString: {
                            $round: [{ $ifNull: ["$rating", 0] }, 1],
                        },
                    },
                    review: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ]);
        const result_count = yield model_user_reviews_1.user_reviews.countDocuments({
            reviewed_user_id: reviewObjectId,
        });
        yield (0, response_functions_1.multiSuccessRes)(res, res.__("Reviews list fetched successfully"), result_count, result);
        return;
    }
    catch (error) {
        console.log("Error: ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.userReviews = userReviews;
const paymentList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { user_id, page = 1, limit = 10, ln } = req.body;
        i18n.setLocale(req, ln);
        const userObjectId = yield (0, user_function_1.objectId)(user_id);
        const totalAmount = yield model_payments_1.payments.aggregate([
            {
                $match: {
                    is_deleted: false,
                    user_id: userObjectId,
                },
            },
            {
                $group: {
                    _id: userObjectId,
                    total_amount: { $sum: "$amount" },
                },
            },
            {
                $project: {
                    _id: 0,
                    total_amount: 1,
                },
            },
        ]);
        const payment_list = yield model_payments_1.payments.aggregate([
            {
                $match: {
                    is_deleted: false,
                    user_id: userObjectId,
                },
            },
            {
                $sort: {
                    createdAt: -1,
                },
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
                    as: "user_detail",
                },
            },
            {
                $unwind: {
                    path: "$user_detail",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "pets",
                    localField: "pet_id",
                    foreignField: "_id",
                    as: "pet_detail",
                },
            },
            {
                $unwind: {
                    path: "$pet_detail",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $addFields: {
                    pet_name: "$pet_detail.pet_name",
                },
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    pet_id: 1,
                    payment_id: 1,
                    transaction_id: 1,
                    payment_method: 1,
                    payment_status: 1,
                    amount: 1,
                    payment_date: 1,
                    pet_name: 1,
                    is_deleted: 1,
                },
            },
        ]);
        const payment_list_count = yield model_payments_1.payments.countDocuments({
            is_deleted: false,
            user_id: userObjectId,
        });
        yield (0, response_functions_1.countMultiSuccessRes)(res, res.__("Payment list get successfully."), payment_list_count, ((_a = totalAmount[0]) === null || _a === void 0 ? void 0 : _a.total_amount) || 0, payment_list);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.paymentList = paymentList;
const allPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "", fromDate, toDate, page = 1, limit = 10, ln, } = req.body;
        i18n.setLocale(req, ln);
        let query = {};
        if (fromDate && toDate) {
            query.payment_date = {
                $gte: new Date(fromDate),
                $lte: new Date(toDate),
            };
        }
        const escapedSearch = search ? yield (0, user_function_1.escapeRegex)(search) : null;
        const payment_list = yield model_payments_1.payments.aggregate([
            {
                $match: Object.assign({ is_deleted: false }, query),
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_detail",
                },
            },
            {
                $unwind: {
                    path: "$user_detail",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "pets",
                    localField: "pet_id",
                    foreignField: "_id",
                    as: "pet_detail",
                },
            },
            {
                $unwind: {
                    path: "$pet_detail",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: escapedSearch
                    ? {
                        $or: [
                            { transaction_id: { $regex: escapedSearch, $options: "i" } },
                            {
                                "user_detail.full_name": {
                                    $regex: escapedSearch,
                                    $options: "i",
                                },
                            },
                            {
                                "pet_detail.pet_name": {
                                    $regex: escapedSearch,
                                    $options: "i",
                                },
                            },
                        ],
                    }
                    : {},
            },
            {
                $sort: {
                    createdAt: -1,
                },
            },
            {
                $skip: (parseInt(page) - 1) * parseInt(limit),
            },
            {
                $limit: parseInt(limit),
            },
            {
                $lookup: {
                    from: "pet_albums",
                    let: {
                        petId: "$pet_id",
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
                $lookup: {
                    from: "user_albums",
                    let: {
                        userId: "$user_id",
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ["$user_id", "$$userId"] }],
                                },
                            },
                        },
                    ],
                    as: "user_album",
                },
            },
            {
                $addFields: {
                    pet_name: "$pet_detail.pet_name",
                    full_name: "$user_detail.full_name",
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
                    user_media: {
                        $cond: {
                            if: { $gt: [{ $size: "$user_album" }, 0] },
                            then: {
                                $cond: {
                                    if: {
                                        $eq: [
                                            { $arrayElemAt: ["$user_album.album_type", 0] },
                                            "image",
                                        ],
                                    },
                                    then: {
                                        $concat: [
                                            process.env.BUCKET_URL,
                                            { $arrayElemAt: ["$user_album.album_path", 0] },
                                        ],
                                    },
                                    else: {
                                        $concat: [
                                            process.env.BUCKET_URL,
                                            { $arrayElemAt: ["$user_album.album_thumbnail", 0] },
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
                    pet_id: 1,
                    payment_id: 1,
                    transaction_id: 1,
                    payment_method: 1,
                    payment_status: 1,
                    amount: 1,
                    payment_date: 1,
                    pet_name: 1,
                    full_name: 1,
                    pet_media: 1,
                    user_media: 1,
                    is_deleted: 1,
                },
            },
        ]);
        const payment_list_count = yield model_payments_1.payments.aggregate([
            {
                $match: Object.assign({ is_deleted: false }, query),
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user_id",
                    foreignField: "_id",
                    as: "user_detail",
                },
            },
            {
                $unwind: {
                    path: "$user_detail",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "pets",
                    localField: "pet_id",
                    foreignField: "_id",
                    as: "pet_detail",
                },
            },
            {
                $unwind: {
                    path: "$pet_detail",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $match: escapedSearch
                    ? {
                        $or: [
                            { transaction_id: { $regex: escapedSearch, $options: "i" } },
                            {
                                "user_detail.full_name": {
                                    $regex: escapedSearch,
                                    $options: "i",
                                },
                            },
                            {
                                "pet_detail.pet_name": {
                                    $regex: escapedSearch,
                                    $options: "i",
                                },
                            },
                        ],
                    }
                    : {},
            },
            {
                $project: {
                    _id: 1,
                },
            },
        ]);
        yield (0, response_functions_1.multiSuccessRes)(res, res.__("Payment list get successfully."), payment_list_count.length, payment_list);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.allPayments = allPayments;

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
exports.userCommunityListing = exports.guestCommunityListing = exports.communityListing = exports.communityUpdatedData = exports.communityDetails = exports.removeCommunityMedia = exports.uploadCommunityMedia = exports.deleteCommunity = exports.editCommunity = exports.addMultipleServices = exports.addCommunity = void 0;
const i18n_1 = __importDefault(require("i18n"));
const model_communities_1 = require("../../../model/model.communities");
const model_users_1 = require("../../../model/model.users");
const model_guests_1 = require("../../../model/model.guests");
const model_notifications_1 = require("../../../model/model.notifications");
const model_communities_albums_1 = require("../../../model/model.communities_albums");
const fs_1 = __importDefault(require("fs"));
const response_functions_1 = require("../../../../util/response_functions");
const user_function_1 = require("../../../../util/user_function");
const send_notifications_1 = require("../../../../util/send_notifications");
const bucket_manager_1 = require("../../../../util/bucket_manager");
const addCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { title, location, address, description, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const insert_data = {
            user_id,
            title,
            address,
            description,
        };
        if (location) {
            const location_json_parse = JSON.parse(location);
            insert_data.location = location_json_parse;
        }
        const newCommunity = yield model_communities_1.communities.create(insert_data);
        if (newCommunity) {
            const userObjectId = yield (0, user_function_1.objectId)(user_id);
            const location_parse = JSON.parse(location);
            const find_nearby_users = (yield model_users_1.users.find({
                _id: { $ne: user_id },
                is_deleted: false,
                is_blocked_by_admin: false,
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [
                                location_parse.coordinates[0],
                                location_parse.coordinates[1],
                            ],
                        },
                        $maxDistance: 160934, // 50 miles
                    },
                },
            }));
            const nearUserIds = find_nearby_users.map((user) => user._id.toString());
            const find_nearby_guest_users = yield model_guests_1.guests.find({
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [
                                location_parse.coordinates[0],
                                location_parse.coordinates[1],
                            ],
                        },
                        $maxDistance: 160934, // 50 miles
                    },
                },
            });
            const nearUserDeviceTokens = find_nearby_guest_users.map((user) => user.device_token);
            const deviceTokenData = yield (0, user_function_1.findMultipleUserDeviceToken)(nearUserIds);
            const noti_msg = "Don’t miss out! Someone shared something in the community.";
            const noti_title = "Someone posted in the community";
            const noti_for = "new_community";
            const notiData = {
                noti_msg,
                noti_title,
                noti_for,
                device_token: Array.isArray(deviceTokenData) ? deviceTokenData : [],
                community_id: newCommunity._id,
                id: newCommunity._id.toString(),
                sound_name: "default",
            };
            yield model_notifications_1.notifications.create({
                sender_id: userObjectId,
                receiver_ids: nearUserIds,
                noti_title,
                noti_msg,
                noti_for,
                community_id: newCommunity._id,
            });
            if (Array.isArray(deviceTokenData) && deviceTokenData.length > 0) {
                yield (0, send_notifications_1.multiNotificationSend)(notiData);
                yield (0, user_function_1.incMultipleUserNotificationBadge)(nearUserIds);
            }
            const notiDataGuest = {
                noti_msg,
                noti_title,
                noti_for,
                device_token: nearUserDeviceTokens,
                community_id: newCommunity._id,
                id: newCommunity._id.toString(),
                sound_name: "default",
            };
            if (nearUserDeviceTokens.length > 0) {
                yield (0, send_notifications_1.multiNotificationSend)(notiDataGuest);
            }
        }
        yield (0, response_functions_1.successRes)(res, res.__("The Community has been successfully added."), newCommunity);
    }
    catch (error) {
        console.error("Error:", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
    }
});
exports.addCommunity = addCommunity;
const addMultipleServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { title, location, address, description, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        for (let i = 1; i <= 500; i++) {
            const insert_data = {
                user_id,
                title,
                address,
                description,
            };
            if (location) {
                const location_json_parse = JSON.parse(location);
                insert_data.location = location_json_parse;
            }
            const newService = yield model_communities_1.communities.create(insert_data);
            const fileData = {
                user_id: user_id,
                community_id: newService._id.toString(),
                album_type: "image",
                album_thumbnail: null,
                album_path: "community_media/8324_1749737660281.jpg",
            };
            yield model_communities_albums_1.communities_albums.create(fileData);
            console.log("No of community: ", i);
        }
    }
    catch (error) {
        console.log("Error in addMultipleServices:", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.addMultipleServices = addMultipleServices;
const editCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { community_id, title, location, address, description, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_community = yield (0, user_function_1.findCommunity)(community_id);
        if (!find_community) {
            yield (0, response_functions_1.errorRes)(res, res.__("Community not found."));
            return;
        }
        const find_users_community = yield (0, user_function_1.findUsersCommunity)(user_id, community_id);
        if (!find_users_community) {
            yield (0, response_functions_1.errorRes)(res, res.__("You don't have permission to edit this community."));
            return;
        }
        const updated_data = {
            user_id,
            title,
            address,
            description,
        };
        if (location) {
            const location_json_parse = JSON.parse(location);
            updated_data.location = location_json_parse;
        }
        yield model_communities_1.communities.updateOne({
            _id: community_id,
        }, {
            $set: updated_data,
        });
        const updated_community = yield (0, user_function_1.findCommunity)(community_id);
        yield (0, response_functions_1.successRes)(res, res.__("The community has been successfully updated."), updated_community);
        return;
    }
    catch (error) {
        console.log("Error:", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.editCommunity = editCommunity;
const deleteCommunity = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { community_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_community = yield (0, user_function_1.findCommunity)(community_id);
        if (!find_community) {
            yield (0, response_functions_1.errorRes)(res, res.__("Community not found."));
            return;
        }
        const find_users_community = yield (0, user_function_1.findUsersCommunity)(user_id, community_id);
        if (!find_users_community) {
            yield (0, response_functions_1.errorRes)(res, res.__("You don't have permission to delete this community."));
            return;
        }
        const response = yield (0, user_function_1.findCommunityAlbums)(user_id, community_id);
        const toAlbums = (val) => Array.isArray(val) ? val : [];
        const albums = Array.isArray(response)
            ? toAlbums(response)
            : Array.isArray(response.data)
                ? toAlbums(response.data)
                : [];
        for (const element of albums) {
            if (element.album_type === "video") {
                if (element.album_path) {
                    yield (0, bucket_manager_1.removeMediaFromS3Bucket)(element.album_path);
                }
                if (element.album_thumbnail) {
                    yield (0, bucket_manager_1.removeMediaFromS3Bucket)(element.album_thumbnail);
                }
            }
            else if (element.album_path) {
                yield (0, bucket_manager_1.removeMediaFromS3Bucket)(element.album_path);
            }
        }
        yield model_communities_1.communities.updateOne({
            _id: community_id,
        }, {
            $set: { is_deleted: true },
        });
        yield model_notifications_1.notifications.deleteMany({ community_id: community_id });
        yield (0, response_functions_1.successRes)(res, res.__("The community has been successfully deleted."), []);
        return;
    }
    catch (error) {
        console.log("Error:", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.deleteCommunity = deleteCommunity;
const uploadCommunityMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const user_id = req.user._id;
        const { community_id, album_type, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const folder_name = "community_media";
        const folder_name_thumbnail = "video_thumbnail";
        if (!req.files || typeof req.files !== "object") {
            yield (0, response_functions_1.errorRes)(res, res.__("No files were uploaded."));
            return;
        }
        const convertToMediaFile = (file) => ({
            originalFilename: file.originalname,
            path: file.path,
            mimetype: file.mimetype,
            data: fs_1.default.readFileSync(file.path),
        });
        let album = ((_a = req.files["album"]) === null || _a === void 0 ? void 0 : _a.map(convertToMediaFile)) || [];
        let thumbnail = ((_b = req.files["thumbnail"]) === null || _b === void 0 ? void 0 : _b.map(convertToMediaFile)) || [];
        if (!album) {
            yield (0, response_functions_1.errorRes)(res, res.__("Album file is missing."));
            return;
        }
        if (!Array.isArray(album)) {
            album = [album];
        }
        if (thumbnail && !Array.isArray(thumbnail)) {
            thumbnail = [thumbnail];
        }
        let albumType = [];
        if (album_type) {
            albumType = JSON.parse(album_type);
        }
        const uploadedFiles = [];
        for (let i = 0; i < albumType.length; i++) {
            const album_type_i = albumType[i];
            const media = thumbnail[0];
            const content_type = media.mimetype || "image/jpeg";
            const fileData = fs_1.default.readFileSync(media.path);
            const mediaFile = {
                originalFilename: media.originalFilename,
                path: media.path,
                mimetype: media.mimetype,
                data: fileData,
            };
            const res_upload_file = yield (0, bucket_manager_1.uploadMediaIntoS3Bucket)(mediaFile, folder_name, content_type);
            if (res_upload_file.status) {
                const user_image_path = `${folder_name}/` + res_upload_file.file_name;
                if (album_type_i === "image") {
                    const fileData = {
                        user_id,
                        community_id,
                        album_type: album_type_i,
                        album_thumbnail: null,
                        album_path: user_image_path,
                    };
                    const add_albums = yield model_communities_albums_1.communities_albums.create(fileData);
                    add_albums.album_path =
                        process.env.BUCKET_URL + add_albums.album_path;
                    uploadedFiles.push(add_albums);
                }
                if (album_type_i === "video") {
                    let thumbnail_image_path = null;
                    if (thumbnail && thumbnail[i]) {
                        const res_upload_thumb = yield (0, bucket_manager_1.uploadMediaIntoS3Bucket)(thumbnail[i], folder_name_thumbnail, "image/jpeg");
                        if (res_upload_thumb.status) {
                            thumbnail_image_path = `${folder_name_thumbnail}/${res_upload_thumb.file_name}`;
                        }
                    }
                    const fileData = {
                        user_id,
                        community_id,
                        album_type: album_type_i,
                        album_thumbnail: thumbnail_image_path,
                        album_path: user_image_path,
                    };
                    const add_albums = yield model_communities_albums_1.communities_albums.create(fileData);
                    add_albums.album_path =
                        process.env.BUCKET_URL + add_albums.album_path;
                    add_albums.album_thumbnail = thumbnail_image_path
                        ? process.env.BUCKET_URL + thumbnail_image_path
                        : undefined;
                    uploadedFiles.push(add_albums);
                }
            }
            else {
                yield (0, response_functions_1.errorRes)(res, res.__("Media upload failed for one of the files."));
                return;
            }
        }
        yield (0, response_functions_1.successRes)(res, res.__("Community media uploaded successfully."), uploadedFiles);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.uploadCommunityMedia = uploadCommunityMedia;
const removeCommunityMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { album_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const userAlbum = yield (0, user_function_1.findCommunityAlbumById)(album_id, user_id);
        if (!userAlbum || userAlbum.status === "error") {
            yield (0, response_functions_1.errorRes)(res, res.__("Album not found."));
            return;
        }
        const album = userAlbum;
        const res_remove_file = yield (0, bucket_manager_1.removeMediaFromS3Bucket)(album.album_path);
        if (album.album_type === "video" && album.album_thumbnail) {
            yield (0, bucket_manager_1.removeMediaFromS3Bucket)(album.album_thumbnail);
        }
        if (res_remove_file.status) {
            yield model_communities_albums_1.communities_albums.deleteOne({ _id: album_id });
            yield (0, response_functions_1.successRes)(res, res.__("Media removed successfully."), []);
        }
        else {
            yield (0, response_functions_1.errorRes)(res, res.__("Failed to remove community media."));
        }
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
    }
});
exports.removeCommunityMedia = removeCommunityMedia;
const communityDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { community_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_community = yield (0, user_function_1.findCommunity)(community_id);
        if (!find_community) {
            yield (0, response_functions_1.errorRes)(res, res.__("Community not found."));
            return;
        }
        const communityObjectId = yield (0, user_function_1.objectId)(community_id);
        const community_detail = yield model_communities_1.communities.aggregate([
            {
                $match: {
                    _id: communityObjectId,
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
                    user_profile: 1,
                    full_name: "$user_details.full_name",
                },
            },
        ]);
        yield (0, response_functions_1.successRes)(res, res.__("Community detail get successfully."), community_detail);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.communityDetails = communityDetails;
const communityUpdatedData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { community_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const communityObjectId = yield (0, user_function_1.objectId)(community_id);
        const community_detail = yield model_communities_1.communities.aggregate([
            {
                $match: {
                    _id: communityObjectId,
                    is_deleted: false,
                },
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
        yield (0, response_functions_1.successRes)(res, res.__("Successfully updated community data."), community_detail);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.communityUpdatedData = communityUpdatedData;
const communityListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { search = "", page = 1, limit = 10, lat, long, miles_distance = 100, ln, } = req.body;
        i18n_1.default.setLocale(req, ln);
        const escapedSearch = search ? yield (0, user_function_1.escapeRegex)(search) : null;
        const query = {
            is_deleted: false,
            user_id: { $ne: user_id },
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
                { title: { $regex: escapedSearch, $options: "i" } },
                { description: { $regex: escapedSearch, $options: "i" } },
            ];
        }
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
                    title: 1,
                    location: 1,
                    address: 1,
                    description: 1,
                    is_deleted: 1,
                    communities_media: 1,
                    user_media: 1,
                    createdAt: 1,
                    full_name: "$user_details.full_name",
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
exports.communityListing = communityListing;
const guestCommunityListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "", page = 1, limit = 10, lat, long, miles_distance = 100, ln, } = req.body;
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
                { title: { $regex: escapedSearch, $options: "i" } },
                { description: { $regex: escapedSearch, $options: "i" } },
            ];
        }
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
                    title: 1,
                    location: 1,
                    address: 1,
                    description: 1,
                    is_deleted: 1,
                    communities_media: 1,
                    user_media: 1,
                    createdAt: 1,
                    full_name: "$user_details.full_name",
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
exports.guestCommunityListing = guestCommunityListing;
const userCommunityListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { profile_user_id, page = 1, limit = 10, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
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
                    title: 1,
                    location: 1,
                    address: 1,
                    description: 1,
                    is_deleted: 1,
                    communities_media: 1,
                    user_media: 1,
                    createdAt: 1,
                    full_name: "$user_details.full_name",
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
exports.userCommunityListing = userCommunityListing;

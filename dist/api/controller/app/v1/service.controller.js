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
exports.guestUserServiceList = exports.userServiceListing = exports.serviceFavoriteList = exports.guestServiceListing = exports.serviceListing = exports.serviceUpdatedData = exports.guestServiceDetails = exports.serviceDetails = exports.removeServiceMedia = exports.uploadServiceMedia = exports.likeDislikeServices = exports.deleteService = exports.editService = exports.addMultipleServices = exports.addService = void 0;
const i18n_1 = __importDefault(require("i18n"));
const model_services_1 = require("./../../../model/model.services");
const model_users_1 = require("./../../../model/model.users");
const model_notifications_1 = require("./../../../model/model.notifications");
const model_guests_1 = require("./../../../model/model.guests");
const model_service_albums_1 = require("./../../../model/model.service_albums");
const model_service_likes_1 = require("./../../../model/model.service_likes");
const response_functions_1 = require("./../../../../util/response_functions");
const send_notifications_1 = require("./../../../../util/send_notifications");
const user_function_1 = require("./../../../../util/user_function");
const bucket_manager_1 = require("./../../../../util/bucket_manager");
const addService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { service_name, location, address, price, description, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const insert_data = {
            user_id: user_id,
            service_name: service_name,
            address: address,
            price: price,
            description: description,
            location: location || null,
        };
        if (location) {
            const location_json_parse = JSON.parse(location);
            insert_data.location = location_json_parse;
        }
        const newService = yield model_services_1.services.create(insert_data);
        if (newService) {
            const userObjectId = yield (0, user_function_1.objectId)(user_id);
            let notiData = {};
            const location_parse = JSON.parse(location);
            const find_nearby_users = yield model_users_1.users.find({
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
                        $maxDistance: 160934, //Distance in meters  - 50 miles
                    },
                },
            });
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
                        $maxDistance: 160934, //Distance in meters  - 50 miles
                    },
                },
            });
            const nearUserIds = find_nearby_users.map((user) => user._id);
            const nearUserDeviceTokens = find_nearby_guest_users.map((user) => user.device_token);
            const deviceTokenData = yield (0, user_function_1.findMultipleUserDeviceToken)(nearUserIds);
            let noti_msg = `A new ${newService.service_name} is now available in your area!`;
            let noti_title = "New Service Nearby";
            let noti_for = "new_service";
            notiData = {
                noti_msg,
                noti_title,
                noti_for,
                device_token: deviceTokenData,
                service_id: newService._id,
                id: newService._id,
            };
            yield model_notifications_1.notifications.create({
                sender_id: userObjectId,
                receiver_ids: nearUserIds,
                noti_title: noti_title,
                noti_msg: `A new service_name is now available in your area!`,
                noti_for: noti_for,
                service_id: newService._id,
            });
            if (Array.isArray(deviceTokenData) && deviceTokenData.length > 0) {
                (0, send_notifications_1.multiNotificationSend)(notiData);
                (0, user_function_1.incMultipleUserNotificationBadge)(nearUserIds);
            }
            const notiDataGuest = {
                noti_msg,
                noti_title,
                noti_for,
                device_token: nearUserDeviceTokens,
                service_id: newService._id,
                id: newService._id,
            };
            if (Array.isArray(nearUserDeviceTokens) &&
                nearUserDeviceTokens.length > 0) {
                (0, send_notifications_1.multiNotificationSend)(notiDataGuest);
            }
        }
        yield (0, response_functions_1.successRes)(res, res.__("The service has been successfully added."), newService);
        return;
    }
    catch (error) {
        console.log("Error:", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.addService = addService;
const addMultipleServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { service_name, location, address, price, description, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        for (let i = 1; i <= 500; i++) {
            const insert_data = {
                user_id: user_id,
                service_name: `${service_name} ${i}`,
                address: address,
                price: price,
                description: description,
                location: location || null,
            };
            if (location) {
                const location_json_parse = JSON.parse(location);
                insert_data.location = location_json_parse;
            }
            const newService = yield model_services_1.services.create(insert_data);
            const fileData = {
                user_id: user_id,
                service_id: newService._id,
                album_type: "image",
                album_thumbnail: null,
                album_path: "service_media/1043_1749735486495.jpg",
            };
            yield model_service_albums_1.service_albums.create(fileData);
            console.log("No of service: ", i);
        }
    }
    catch (error) {
        console.log("Error in addMultipleServices:", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.addMultipleServices = addMultipleServices;
const editService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { service_id, service_name, location, address, price, description, ln, } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_service = yield (0, user_function_1.findService)(service_id);
        if (!find_service) {
            yield (0, response_functions_1.errorRes)(res, res.__("Service not found."));
            return;
        }
        const find_users_service = yield (0, user_function_1.findUsersService)(user_id, service_id);
        if (!find_users_service) {
            yield (0, response_functions_1.errorRes)(res, res.__("You don't have permission to edit this service."));
            return;
        }
        const updated_data = {
            service_name: service_name,
            address: address,
            price: price,
            description: description,
            location: location || null,
        };
        if (location) {
            const location_json_parse = JSON.parse(location);
            updated_data.location = location_json_parse;
        }
        yield model_services_1.services.updateOne({
            _id: service_id,
        }, {
            $set: updated_data,
        });
        const updated_service = yield (0, user_function_1.findService)(service_id);
        yield (0, response_functions_1.successRes)(res, res.__("The service has been successfully updated."), updated_service);
        return;
    }
    catch (error) {
        console.log("Error:", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.editService = editService;
const deleteService = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { service_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_service = yield (0, user_function_1.findService)(service_id);
        if (!find_service) {
            yield (0, response_functions_1.errorRes)(res, res.__("Service not found."));
            return;
        }
        const find_users_service = yield (0, user_function_1.findUsersService)(user_id, service_id);
        if (!find_users_service) {
            yield (0, response_functions_1.errorRes)(res, res.__("You don't have permission to delete this service."));
            return;
        }
        const find_all_service_albums = yield (0, user_function_1.findServiceAlbums)(user_id, service_id);
        for (const element of find_all_service_albums) {
            if (element.album_type == "video") {
                yield (0, bucket_manager_1.removeMediaFromS3Bucket)(element.album_path);
                yield (0, bucket_manager_1.removeMediaFromS3Bucket)(element.album_thumbnail);
            }
            else {
                yield (0, bucket_manager_1.removeMediaFromS3Bucket)(element.album_path);
            }
        }
        yield model_services_1.services.updateOne({
            _id: service_id,
        }, {
            $set: { is_deleted: true },
        });
        yield model_service_likes_1.service_likes.deleteMany({ service_id: service_id });
        yield model_notifications_1.notifications.deleteMany({ service_id: service_id });
        yield (0, response_functions_1.successRes)(res, res.__("The service has been successfully deleted."), []);
        return;
    }
    catch (error) {
        console.log("Error:", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.deleteService = deleteService;
const likeDislikeServices = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { service_id, is_like, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_service = yield (0, user_function_1.findService)(service_id);
        if (!find_service) {
            yield (0, response_functions_1.errorRes)(res, res.__("Service not found."));
            return;
        }
        if (is_like == true || is_like == "true") {
            const find_like = yield (0, user_function_1.findServiceLike)(user_id, service_id);
            if (find_like) {
                yield (0, response_functions_1.successRes)(res, res.__("Service liked successfully."), []);
                return;
            }
            else {
                yield model_service_likes_1.service_likes.create({
                    user_id: user_id,
                    service_id: service_id,
                });
                yield (0, response_functions_1.successRes)(res, res.__("Service liked successfully."), []);
                return;
            }
        }
        else {
            yield model_service_likes_1.service_likes.deleteOne({
                user_id: user_id,
                service_id: service_id,
            });
            yield (0, response_functions_1.successRes)(res, res.__("Service disliked successfully."), []);
            return;
        }
    }
    catch (error) {
        console.error(error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.likeDislikeServices = likeDislikeServices;
const uploadServiceMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const user_id = req.user._id;
        const { service_id, album_type, ln } = req.body;
        let album = (_a = req.files) === null || _a === void 0 ? void 0 : _a.album;
        let thumbnail = (_b = req.files) === null || _b === void 0 ? void 0 : _b.thumbnail;
        i18n_1.default.setLocale(req, ln);
        const folder_name = "service_media";
        const folder_name_thumbnail = "video_thumbnail";
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
            const media = album[i];
            const content_type = media.type;
            const res_upload_file = yield (0, bucket_manager_1.uploadMediaIntoS3Bucket)(media, folder_name, content_type);
            if (res_upload_file.status) {
                if (album_type_i == "image") {
                    const user_image_path = `${folder_name}/` + res_upload_file.file_name;
                    const fileData = {
                        user_id: user_id,
                        service_id: service_id,
                        album_type: album_type_i,
                        album_thumbnail: null,
                        album_path: user_image_path,
                    };
                    const add_albums = yield model_service_albums_1.service_albums.create(fileData);
                    add_albums.album_path =
                        process.env.BUCKET_URL + add_albums.album_path;
                    uploadedFiles.push(add_albums);
                }
                if (album_type_i == "video") {
                    const file_name = res_upload_file.file_name;
                    const user_image_path = `${folder_name}/${file_name}`;
                    let thumbnail_image_path = null;
                    if (thumbnail && thumbnail[i]) {
                        const res_upload_thumb = yield (0, bucket_manager_1.uploadMediaIntoS3Bucket)(thumbnail[i], folder_name_thumbnail, thumbnail[i].type);
                        if (res_upload_thumb.status) {
                            thumbnail_image_path = `${folder_name_thumbnail}/${res_upload_thumb.file_name}`;
                            const fileData = {
                                user_id: user_id,
                                service_id: service_id,
                                album_type: album_type_i,
                                album_thumbnail: thumbnail_image_path,
                                album_path: user_image_path,
                            };
                            const add_albums = yield model_service_albums_1.service_albums.create(fileData);
                            add_albums.album_path =
                                process.env.BUCKET_URL + add_albums.album_path;
                            add_albums.album_thumbnail =
                                process.env.BUCKET_URL + add_albums.album_thumbnail;
                            uploadedFiles.push(add_albums);
                        }
                    }
                }
            }
            else {
                yield (0, response_functions_1.errorRes)(res, res.__("Media upload failed for one of the files."));
                return;
            }
        }
        yield (0, response_functions_1.successRes)(res, res.__("Service media uploaded successfully."), uploadedFiles);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.uploadServiceMedia = uploadServiceMedia;
const removeServiceMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { album_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const userAlbum = yield (0, user_function_1.findServiceAlbumById)(album_id, user_id);
        if (!userAlbum) {
            yield (0, response_functions_1.errorRes)(res, res.__("Album not found."));
            return;
        }
        else if ("album_path" in userAlbum) {
            const res_remove_file = yield (0, bucket_manager_1.removeMediaFromS3Bucket)(userAlbum.album_path);
            if (userAlbum.album_type == "video" && userAlbum.album_thumbnail) {
                yield (0, bucket_manager_1.removeMediaFromS3Bucket)(userAlbum.album_thumbnail);
            }
            if (res_remove_file.status) {
                yield model_service_albums_1.service_albums.deleteOne({
                    _id: album_id,
                });
                yield (0, response_functions_1.successRes)(res, res.__("Media removed successfully."), []);
                return;
            }
            else {
                yield (0, response_functions_1.errorRes)(res, res.__("Failed to remove service media."));
                return;
            }
        }
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.removeServiceMedia = removeServiceMedia;
const serviceDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
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
                    from: "service_likes",
                    let: { localId: "$_id", userId: user_id },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", "$$userId"] },
                                        { $eq: ["$service_id", "$$localId"] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "service_like",
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
                    is_user_liked: {
                        $cond: {
                            if: { $gt: [{ $size: "$service_like" }, 0] },
                            then: true,
                            else: false,
                        },
                    },
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
                    is_user_liked: 1,
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
exports.serviceDetails = serviceDetails;
const guestServiceDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                    is_user_liked: false,
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
                    is_user_liked: 1,
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
exports.guestServiceDetails = guestServiceDetails;
const serviceUpdatedData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { service_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
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
                },
            },
        ]);
        yield (0, response_functions_1.successRes)(res, res.__("Successfully updated service data."), service_detail);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.serviceUpdatedData = serviceUpdatedData;
const serviceListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { search = "", page = 1, limit = 10, lat, long, miles_distance = 100, ln, } = req.body;
        i18n_1.default.setLocale(req, ln);
        const escapedSearch = search ? yield (0, user_function_1.escapeRegex)(search) : null;
        const query = {
            is_deleted: false,
            user_id: { $ne: user_id },
        };
        if (escapedSearch) {
            query.$or = [
                { service_name: { $regex: escapedSearch, $options: "i" } },
                { description: { $regex: escapedSearch, $options: "i" } },
            ];
        }
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
                // { description: { $regex: escapedSearch, $options: "i" } },
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
                    from: "service_likes",
                    let: { localId: "$_id", userId: user_id },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", "$$userId"] },
                                        { $eq: ["$service_id", "$$localId"] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "service_like",
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
                    is_user_liked: {
                        $cond: {
                            if: { $gt: [{ $size: "$service_like" }, 0] },
                            then: true,
                            else: false,
                        },
                    },
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
                    is_user_liked: 1,
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
exports.serviceListing = serviceListing;
const guestServiceListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "", page = 1, limit = 10, lat, long, miles_distance = 100, ln, } = req.body;
        i18n_1.default.setLocale(req, ln);
        const escapedSearch = search ? yield (0, user_function_1.escapeRegex)(search) : null;
        const query = {
            is_deleted: false,
        };
        if (escapedSearch) {
            query.$or = [
                { service_name: { $regex: escapedSearch, $options: "i" } },
                { description: { $regex: escapedSearch, $options: "i" } },
            ];
        }
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
                    is_user_liked: false,
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
                    is_user_liked: 1,
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
exports.guestServiceListing = guestServiceListing;
const serviceFavoriteList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { page = 1, limit = 10, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const total_services = yield model_service_likes_1.service_likes.countDocuments({
            user_id: user_id,
        });
        const service_list = yield model_service_likes_1.service_likes.aggregate([
            {
                $match: {
                    user_id: user_id,
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
                    is_user_liked: true,
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
                    is_user_liked: 1,
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
exports.serviceFavoriteList = serviceFavoriteList;
const userServiceListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { profile_user_id, page = 1, limit = 10, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
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
                    from: "service_likes",
                    let: { localId: "$_id", userId: user_id },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", "$$userId"] },
                                        { $eq: ["$service_id", "$$localId"] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "service_like",
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
                    is_user_liked: {
                        $cond: {
                            if: { $gt: [{ $size: "$service_like" }, 0] },
                            then: true,
                            else: false,
                        },
                    },
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
                    is_user_liked: 1,
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
exports.userServiceListing = userServiceListing;
const guestUserServiceList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { profile_user_id, page = 1, limit = 10, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
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
                    is_user_liked: false,
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
                    is_user_liked: 1,
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
exports.guestUserServiceList = guestUserServiceList;

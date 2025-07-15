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
exports.guestUserPetListing = exports.userPetListing = exports.petFavoriteList = exports.guestPetListing = exports.petListing = exports.petUpdatedData = exports.guestPetDetails = exports.petDetails = exports.removePetMedia = exports.uploadPetMedia = exports.likeDislikePets = exports.adoptPet = exports.deletePet = exports.editPet = exports.addMultiplePet = exports.addPet = void 0;
const i18n_1 = __importDefault(require("i18n"));
const model_pets_1 = require("../../../model/model.pets");
const model_pet_albums_1 = require("../../../model/model.pet_albums");
const model_users_1 = require("../../../model/model.users");
const model_payments_1 = require("../../../model/model.payments");
const model_guests_1 = require("../../../model/model.guests");
const model_notifications_1 = require("../../../model/model.notifications");
const model_pet_likes_1 = require("../../../model/model.pet_likes");
const response_functions_1 = require("./../../../../util/response_functions");
const send_notifications_1 = require("./../../../../util/send_notifications");
const user_function_1 = require("./../../../../util/user_function");
const bucket_manager_1 = require("./../../../../util/bucket_manager");
const addPet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { pet_name, pet_type, pet_breed, location, address, gender, price, description, ln = "en", } = req.body;
        i18n_1.default.setLocale(req, ln);
        const locationPoint = location
            ? JSON.parse(location)
            : undefined;
        const insert_data = Object.assign({ user_id,
            pet_name,
            pet_type,
            pet_breed,
            address,
            gender, price: price ? Number(price) : undefined, description }, (locationPoint ? { location: locationPoint } : {}));
        const newPet = yield model_pets_1.pets.create(insert_data);
        if (newPet && locationPoint) {
            if (newPet && locationPoint) {
                const userObjectId = yield (0, user_function_1.objectId)(user_id);
                // Find users & guests near this location (50 miles ≈ 160,934 m)
                const [nearUsers, nearGuests] = yield Promise.all([
                    model_users_1.users.find({
                        _id: { $ne: user_id },
                        is_deleted: false,
                        is_blocked_by_admin: false,
                        location: {
                            $near: {
                                $geometry: {
                                    type: "Point",
                                    coordinates: [
                                        locationPoint.coordinates[0],
                                        locationPoint.coordinates[1],
                                    ],
                                },
                                $maxDistance: 160934,
                            },
                        },
                    }),
                    model_guests_1.guests.find({
                        location: {
                            $near: {
                                $geometry: {
                                    type: "Point",
                                    coordinates: [
                                        locationPoint.coordinates[0],
                                        locationPoint.coordinates[1],
                                    ],
                                },
                                $maxDistance: 160934,
                            },
                        },
                    }),
                ]);
                const nearUserIds = nearUsers.map((u) => u._id);
                const guestDeviceTokens = nearGuests.map((g) => g.device_token);
                const userDeviceTokens = yield (0, user_function_1.findMultipleUserDeviceToken)(nearUserIds);
                const noti_msg = `A new ${newPet.pet_name} is available for adoption near you!`;
                const noti_title = "New listing Alert!";
                const noti_for = "new_pet";
                // Registered users
                if (userDeviceTokens.length) {
                    const notiData = {
                        device_token: userDeviceTokens,
                        noti_title,
                        noti_msg,
                        noti_for,
                        id: newPet._id.toString(),
                        sound_name: "default",
                    };
                    yield model_notifications_1.notifications.create({
                        sender_id: userObjectId,
                        receiver_ids: nearUserIds,
                        noti_title,
                        noti_msg,
                        noti_for,
                        pet_id: newPet._id.toString(),
                    });
                    (0, send_notifications_1.multiNotificationSend)(notiData);
                    (0, user_function_1.incMultipleUserNotificationBadge)(nearUserIds);
                }
                // Guest users
                if (guestDeviceTokens.length) {
                    const notiDataGuest = {
                        device_token: guestDeviceTokens,
                        noti_title,
                        noti_msg,
                        noti_for,
                        id: newPet._id.toString(),
                        sound_name: "default",
                    };
                    (0, send_notifications_1.multiNotificationSend)(notiDataGuest);
                }
            }
            yield (0, response_functions_1.successRes)(res, res.__("The pet has been successfully added."), newPet);
        }
    }
    catch (error) {
        console.error("addPet error:", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
    }
});
exports.addPet = addPet;
const addMultiplePet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { pet_name, pet_type, pet_breed, location, address, gender, price, description, ln, } = req.body;
        i18n_1.default.setLocale(req, ln);
        for (let i = 1; i <= 500; i++) {
            const insert_data = {
                user_id: user_id,
                pet_name: `${pet_name} ${i}`,
                pet_type: pet_type,
                pet_breed: pet_breed,
                address: address,
                gender: gender,
                price: price,
                description: description,
            };
            if (location) {
                const location_json_parse = JSON.parse(location);
                insert_data.location = location_json_parse;
            }
            const newPet = yield model_pets_1.pets.create(insert_data);
            const fileData = {
                user_id: user_id,
                pet_id: newPet._id.toString(),
                album_type: "image",
                album_thumbnail: null,
                album_path: "pet_media/7278_1749737449083.jpg",
            };
            yield model_pet_albums_1.pet_albums.create(fileData);
            console.log("No of pet: ", i);
        }
        yield (0, response_functions_1.successRes)(res, res.__("The pets have been successfully added."), []);
        return;
    }
    catch (error) {
        console.log("Error:", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.addMultiplePet = addMultiplePet;
const editPet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { pet_id, pet_name, pet_type, pet_breed, location, address, gender, price, description, ln, } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_pet = yield (0, user_function_1.findPet)(pet_id);
        if (!find_pet) {
            yield (0, response_functions_1.errorRes)(res, res.__("Pet not found."));
            return;
        }
        const find_users_pet = yield (0, user_function_1.findUsersPet)(user_id, pet_id);
        if (!find_users_pet) {
            yield (0, response_functions_1.errorRes)(res, res.__("You don't have permission to edit this pet."));
            return;
        }
        const updated_data = {
            pet_name: pet_name,
            pet_type: pet_type,
            pet_breed: pet_breed,
            address: address,
            gender: gender,
            price: price,
            description: description,
        };
        if (location) {
            const location_json_parse = JSON.parse(location);
            updated_data.location = location_json_parse;
        }
        yield model_pets_1.pets.updateOne({
            _id: pet_id,
        }, {
            $set: updated_data,
        });
        const updated_pet = yield (0, user_function_1.findPet)(pet_id);
        yield (0, response_functions_1.successRes)(res, res.__("The pet has been successfully updated."), updated_pet);
        return;
    }
    catch (error) {
        console.log("Error:", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.editPet = editPet;
const deletePet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { pet_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_pet = yield (0, user_function_1.findPet)(pet_id);
        if (!find_pet) {
            yield (0, response_functions_1.errorRes)(res, res.__("Pet not found."));
            return;
        }
        const find_users_pet = yield (0, user_function_1.findUsersPet)(user_id, pet_id);
        if (!find_users_pet) {
            yield (0, response_functions_1.errorRes)(res, res.__("You don't have permission to delete this pet."));
            return;
        }
        const find_all_pet_albums = yield (0, user_function_1.findPetAlbums)(user_id, pet_id);
        if (Array.isArray(find_all_pet_albums)) {
            for (const element of find_all_pet_albums) {
                if (element.album_type === "video") {
                    yield (0, bucket_manager_1.removeMediaFromS3Bucket)(element.album_path);
                    if (element.album_thumbnail) {
                        yield (0, bucket_manager_1.removeMediaFromS3Bucket)(element.album_thumbnail);
                    }
                }
                else {
                    yield (0, bucket_manager_1.removeMediaFromS3Bucket)(element.album_path);
                }
            }
        }
        yield model_pets_1.pets.updateOne({
            _id: pet_id,
        }, {
            $set: { is_deleted: true },
        });
        yield model_pet_likes_1.pet_likes.deleteMany({ pet_id: pet_id });
        yield model_notifications_1.notifications.deleteMany({ pet_id: pet_id });
        yield model_payments_1.payments.deleteMany({ pet_id: pet_id });
        yield model_pet_albums_1.pet_albums.deleteMany({ pet_id: pet_id });
        yield (0, response_functions_1.successRes)(res, res.__("The pet has been successfully deleted."), []);
        return;
    }
    catch (error) {
        console.log("Error:", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.deletePet = deletePet;
const adoptPet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { pet_id, is_adopted, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_pet = yield (0, user_function_1.findPet)(pet_id);
        if (!find_pet) {
            yield (0, response_functions_1.errorRes)(res, res.__("Pet not found."));
            return;
        }
        const find_users_pet = yield (0, user_function_1.findUsersPet)(user_id, pet_id);
        if (!find_users_pet) {
            yield (0, response_functions_1.errorRes)(res, res.__("You don't have permission to modify this pet."));
            return;
        }
        if ("is_adopted" in find_pet) {
            if (is_adopted === true || is_adopted === "true") {
                if (find_pet.is_adopted === true ||
                    find_pet.is_adopted === "true") {
                    yield (0, response_functions_1.successRes)(res, res.__("The pet has already been marked as adopted."), []);
                    return;
                }
                else {
                    yield model_pets_1.pets.updateOne({
                        _id: pet_id,
                    }, {
                        $set: { is_adopted: true },
                    });
                    yield (0, response_functions_1.successRes)(res, res.__("The pet has been successfully marked as adopted."), []);
                    return;
                }
            }
            else {
                if (find_pet.is_adopted === false ||
                    find_pet.is_adopted === "false") {
                    yield (0, response_functions_1.successRes)(res, res.__("The pet is already marked as available for adoption."), []);
                    return;
                }
                else {
                    yield model_pets_1.pets.updateOne({
                        _id: pet_id,
                    }, {
                        $set: { is_adopted: false },
                    });
                    yield (0, response_functions_1.successRes)(res, res.__("The pet has been successfully marked as available for adoption."), []);
                    return;
                }
            }
        }
    }
    catch (error) {
        console.log("Error:", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.adoptPet = adoptPet;
const likeDislikePets = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { pet_id, is_like, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_pet = yield (0, user_function_1.findPet)(pet_id);
        if (!find_pet) {
            yield (0, response_functions_1.errorRes)(res, res.__("Pet not found."));
            return;
        }
        if (is_like === true || is_like === "true") {
            const find_like = yield (0, user_function_1.findPetLike)(user_id, pet_id);
            if (find_like) {
                yield (0, response_functions_1.successRes)(res, res.__("Pet liked successfully."), []);
                return;
            }
            else {
                yield model_pet_likes_1.pet_likes.create({ user_id: user_id, pet_id: pet_id });
                yield (0, response_functions_1.successRes)(res, res.__("Pet liked successfully."), []);
                return;
            }
        }
        else {
            yield model_pet_likes_1.pet_likes.deleteOne({ user_id: user_id, pet_id: pet_id });
            yield (0, response_functions_1.successRes)(res, res.__("Pet disliked successfully."), []);
            return;
        }
    }
    catch (error) {
        console.error(error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.likeDislikePets = likeDislikePets;
const uploadPetMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const user_id = req.user._id;
        const { pet_id, album_type, ln = "en" } = req.body;
        i18n_1.default.setLocale(req, ln);
        const files = (_a = req.files) !== null && _a !== void 0 ? _a : {};
        // Always work with arrays
        const albumFiles = files.album
            ? Array.isArray(files.album)
                ? files.album
                : [files.album]
            : [];
        const thumbnailFiles = files.thumbnail
            ? Array.isArray(files.thumbnail)
                ? files.thumbnail
                : [files.thumbnail]
            : [];
        const albumTypes = album_type ? JSON.parse(album_type) : [];
        const uploadedFiles = [];
        const mediaFolder = "pet_media";
        const thumbFolder = "video_thumbnail";
        const bucketUrl = (_b = process.env.BUCKET_URL) !== null && _b !== void 0 ? _b : "";
        for (let i = 0; i < albumTypes.length; i += 1) {
            const currentType = albumTypes[i]; // "image" | "video"
            const mediaFile = albumFiles[i];
            // Skip if the arrays are mismatched
            if (!mediaFile)
                continue;
            const uploadRes = yield (0, bucket_manager_1.uploadMediaIntoS3Bucket)({
                originalFilename: mediaFile.name,
                mimetype: mediaFile.type,
                data: mediaFile.data,
                path: mediaFile.path,
            }, mediaFolder, mediaFile.type);
            if (!uploadRes.status) {
                yield (0, response_functions_1.errorRes)(res, res.__("Media upload failed for one of the files."));
                return;
            }
            // Shared path variables
            const fileName = uploadRes.file_name;
            const mediaPath = `${mediaFolder}/${fileName}`;
            if (currentType === "image") {
                const doc = yield model_pet_albums_1.pet_albums.create({
                    user_id,
                    pet_id,
                    album_type: "image",
                    album_thumbnail: null,
                    album_path: mediaPath,
                });
                doc.album_path = bucketUrl + doc.album_path;
                uploadedFiles.push(doc);
                continue;
            }
            if (currentType === "video") {
                let thumbPath = null;
                if (thumbnailFiles[i]) {
                    const thumbRes = yield (0, bucket_manager_1.uploadMediaIntoS3Bucket)(thumbnailFiles[i], thumbFolder, thumbnailFiles[i].type);
                    if (!thumbRes.status) {
                        yield (0, response_functions_1.errorRes)(res, res.__("Thumbnail upload failed."));
                        return;
                    }
                    thumbPath = `${thumbFolder}/${thumbRes.file_name}`;
                }
                const doc = yield model_pet_albums_1.pet_albums.create({
                    user_id,
                    pet_id,
                    album_type: "video",
                    album_thumbnail: thumbPath,
                    album_path: mediaPath,
                });
                doc.album_path = bucketUrl + doc.album_path;
                if (doc.album_thumbnail) {
                    doc.album_thumbnail = bucketUrl + doc.album_thumbnail;
                }
                uploadedFiles.push(doc);
            }
        }
        /* ── Success response ───────────────────────────────────── */
        yield (0, response_functions_1.successRes)(res, res.__("Pet media uploaded successfully."), uploadedFiles);
    }
    catch (err) {
        console.error("uploadPetMedia error:", err);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
    }
});
exports.uploadPetMedia = uploadPetMedia;
const removePetMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { album_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const userAlbum = yield (0, user_function_1.findPetAlbumById)(album_id, user_id);
        if (!userAlbum) {
            yield (0, response_functions_1.errorRes)(res, res.__("Album not found."));
            return;
        }
        else if ("album_path" in userAlbum) {
            const res_remove_file = yield (0, bucket_manager_1.removeMediaFromS3Bucket)(userAlbum.album_path);
            if (userAlbum.album_type === "video" && userAlbum.album_thumbnail) {
                yield (0, bucket_manager_1.removeMediaFromS3Bucket)(userAlbum.album_thumbnail);
            }
            if (res_remove_file.status) {
                yield model_pet_albums_1.pet_albums.deleteOne({
                    _id: album_id,
                });
                yield (0, response_functions_1.successRes)(res, res.__("Media removed successfully."), []);
                return;
            }
            else {
                yield (0, response_functions_1.errorRes)(res, res.__("Failed to remove pet media."));
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
exports.removePetMedia = removePetMedia;
const petDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
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
                    from: "pet_likes",
                    let: { localId: "$_id", userId: user_id },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", "$$userId"] },
                                        { $eq: ["$pet_id", "$$localId"] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "pet_like",
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
                    is_user_liked: {
                        $cond: {
                            if: { $gt: [{ $size: "$pet_like" }, 0] },
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
                    is_user_liked: 1,
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
exports.petDetails = petDetails;
const guestPetDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                    is_user_liked: 1,
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
exports.guestPetDetails = guestPetDetails;
const petUpdatedData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pet_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const petObjectId = yield (0, user_function_1.objectId)(pet_id);
        const pet_detail = yield model_pets_1.pets.aggregate([
            {
                $match: {
                    _id: petObjectId,
                    is_adopted: false,
                    is_deleted: false,
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
                },
            },
        ]);
        yield (0, response_functions_1.successRes)(res, res.__("Successfully updated pet data."), pet_detail);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.petUpdatedData = petUpdatedData;
const petListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { search = "", pet_type, pet_breed, gender, page = 1, limit = 10, lat, long, miles_distance = 100, ln, } = req.body;
        i18n_1.default.setLocale(req, ln);
        console.log("req.body", req.body);
        const escapedSearch = search ? yield (0, user_function_1.escapeRegex)(search) : null;
        const query = {
            is_deleted: false,
            is_adopted: false,
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
                // { description: { $regex: escapedSearch, $options: "i" } },
            ];
        }
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
                    from: "pet_likes",
                    let: { localId: "$_id", userId: user_id },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", "$$userId"] },
                                        { $eq: ["$pet_id", "$$localId"] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "pet_like",
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
                    is_user_liked: {
                        $cond: {
                            if: { $gt: [{ $size: "$pet_like" }, 0] },
                            then: true,
                            else: false,
                        },
                    },
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
                    is_user_liked: 1,
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
exports.petListing = petListing;
const guestPetListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "", pet_type, pet_breed, gender, page = 1, limit = 10, lat, long, miles_distance = 100, ln, } = req.body;
        i18n_1.default.setLocale(req, ln);
        console.log("req.body", req.body);
        const escapedSearch = search ? yield (0, user_function_1.escapeRegex)(search) : null;
        const query = {
            is_deleted: false,
            is_adopted: false,
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
                // { description: { $regex: escapedSearch, $options: "i" } },
            ];
        }
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
                    is_user_liked: false,
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
                    is_user_liked: 1,
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
exports.guestPetListing = guestPetListing;
const petFavoriteList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { page = 1, limit = 10, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const total_pets = yield model_pet_likes_1.pet_likes.countDocuments({
            user_id: user_id,
        });
        const pet_list = yield model_pet_likes_1.pet_likes.aggregate([
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
                    is_user_liked: true,
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
                    is_user_liked: 1,
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
exports.petFavoriteList = petFavoriteList;
const userPetListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { profile_user_id, page = 1, limit = 10, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
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
                    from: "pet_likes",
                    let: { localId: "$_id", userId: user_id },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", "$$userId"] },
                                        { $eq: ["$pet_id", "$$localId"] },
                                    ],
                                },
                            },
                        },
                    ],
                    as: "pet_like",
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
                    is_user_liked: {
                        $cond: {
                            if: { $gt: [{ $size: "$pet_like" }, 0] },
                            then: true,
                            else: false,
                        },
                    },
                    // pet_media: {
                    //     $cond: {
                    //         if: { $gt: [{ $size: "$pet_album" }, 0] },
                    //         then: { $concat: [process.env.BUCKET_URL, { $arrayElemAt: ["$pet_album.album_path", 0] }] },
                    //         else: null
                    //     }
                    // },
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
                    is_user_liked: 1,
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
exports.userPetListing = userPetListing;
const guestUserPetListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { profile_user_id, page = 1, limit = 10, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
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
                    is_user_liked: false,
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
                    is_user_liked: 1,
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
exports.guestUserPetListing = guestUserPetListing;

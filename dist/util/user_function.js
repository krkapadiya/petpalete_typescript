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
exports.findFaq = exports.findFaqByName = exports.findContent = exports.findContentByType = exports.objectId = exports.escapeRegex = exports.findMessage = exports.findChatRoom = exports.findServiceAlbumById = exports.findServiceAlbums = exports.findUsersService = exports.findServiceLike = exports.findPetAlbumById = exports.findPetAlbums = exports.findUsersPet = exports.findPetLike = exports.findExistingReview = exports.findOwnReview = exports.findReview = exports.findExistingReport = exports.incNotificationBadge = exports.findExistingPayment = exports.findCommunityAlbumById = exports.findCommunityAlbums = exports.incMultipleUserNotificationBadge = exports.findUsersCommunity = exports.findService = exports.findPet = exports.findVerifyEmailAddress = exports.findMobileNumber = exports.findSocialBlockUser = exports.findCommunity = exports.findSocialEmailAddress = exports.findEmailAddress = exports.findMultipleUserDeviceToken = exports.findDeviceToken = exports.findAlbumById = exports.findUserAlbumId = exports.findUserAlbum = exports.findBlockUser = exports.findUser = exports.findGuestUser = void 0;
// utils/data_helpers.ts
const mongoose_1 = __importDefault(require("mongoose"));
const model_users_1 = require("./../api/model/model.users");
const model_payments_1 = require("../api/model/model.payments");
const model_guests_1 = require("./../api/model/model.guests");
const model_user_albums_1 = require("./../api/model/model.user_albums");
const model_email_varifications_1 = require("./../api/model/model.email_varifications");
const model_app_contents_1 = require("./../api/model/model.app_contents");
const model_faqs_1 = require("./../api/model/model.faqs");
const model_pets_1 = require("./../api/model/model.pets");
const model_report_users_1 = require("./../api/model/model.report_users");
const model_communities_1 = require("./../api/model/model.communities");
const model_communities_albums_1 = require("./../api/model/model.communities_albums");
const model_services_1 = require("./../api/model/model.services");
const model_service_albums_1 = require("./../api/model/model.service_albums");
const model_service_likes_1 = require("./../api/model/model.service_likes");
const model_pet_albums_1 = require("./../api/model/model.pet_albums");
const model_pet_likes_1 = require("./../api/model/model.pet_likes");
const model_user_sessions_1 = require("./../api/model/model.user_sessions");
const model_user_reviews_1 = require("./../api/model/model.user_reviews");
const model_chat_rooms_1 = require("./../api/model/model.chat_rooms");
const model_chats_1 = require("./../api/model/model.chats");
const response_functions_1 = require("./../util/response_functions");
const findGuestUser = (device_token) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_data = yield model_guests_1.guests.findOne({ device_token });
        return user_data;
    }
    catch (error) {
        console.error("Error:", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findGuestUser = findGuestUser;
const findUser = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_data = yield model_users_1.users.findOne({ _id: user_id, is_deleted: false });
        return user_data;
    }
    catch (error) {
        console.error("Error:", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findUser = findUser;
const findBlockUser = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_data = yield model_users_1.users.findOne({
            _id: user_id,
            is_blocked_by_admin: true,
        });
        return user_data;
    }
    catch (error) {
        console.error("Error:", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findBlockUser = findBlockUser;
const findUserAlbum = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user_album_data = yield model_user_albums_1.user_albums.find({
            user_id,
            album_type: "image",
        });
        return (_a = user_album_data[0]) === null || _a === void 0 ? void 0 : _a.album_path;
    }
    catch (error) {
        console.error("Error:", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findUserAlbum = findUserAlbum;
const findUserAlbumId = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const user_album_data = yield model_user_albums_1.user_albums.find({
            user_id,
            album_type: "image",
        });
        return (_a = user_album_data[0]) === null || _a === void 0 ? void 0 : _a._id;
    }
    catch (error) {
        console.error("Error:", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findUserAlbumId = findUserAlbumId;
const findAlbumById = (album_id, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const album_data = yield model_user_albums_1.user_albums.findOne({ _id: album_id, user_id });
        return album_data;
    }
    catch (error) {
        console.error("Error:", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findAlbumById = findAlbumById;
const findDeviceToken = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield model_user_sessions_1.user_sessions
            .find({ user_id, user_type: "user" })
            .distinct("device_token");
    }
    catch (error) {
        console.error("Error:", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findDeviceToken = findDeviceToken;
const findMultipleUserDeviceToken = (user_ids) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield model_user_sessions_1.user_sessions
            .find({ user_id: { $in: user_ids }, user_type: "user" })
            .distinct("device_token");
    }
    catch (error) {
        console.error("Error:", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findMultipleUserDeviceToken = findMultipleUserDeviceToken;
const findEmailAddress = (email_address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield model_users_1.users.findOne({ email_address, is_deleted: false });
    }
    catch (error) {
        console.error("Error:", error);
        return null;
    }
});
exports.findEmailAddress = findEmailAddress;
const findSocialEmailAddress = (email_address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield model_users_1.users.findOne({
            email_address,
            is_social_login: true,
            is_deleted: false,
        });
    }
    catch (error) {
        console.error("Error:", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findSocialEmailAddress = findSocialEmailAddress;
const findCommunity = (community_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const community_data = yield model_communities_1.communities.findOne({
            _id: community_id,
            is_deleted: false,
        });
        return community_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findCommunity = findCommunity;
const findSocialBlockUser = (email_address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield model_users_1.users.findOne({
            email_address,
            is_social_login: true,
            is_blocked_by_admin: true,
            is_deleted: false,
        });
    }
    catch (error) {
        console.error("Error:", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findSocialBlockUser = findSocialBlockUser;
const findMobileNumber = (mobile_number) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield model_users_1.users.findOne({ mobile_number, is_deleted: false });
    }
    catch (error) {
        console.error("Error:", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findMobileNumber = findMobileNumber;
const findVerifyEmailAddress = (email_address) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        return yield model_email_varifications_1.email_verifications.findOne({
            email_address,
            is_email_verified: true,
            is_deleted: false,
        });
    }
    catch (error) {
        console.error("Error:", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findVerifyEmailAddress = findVerifyEmailAddress;
const findPet = (pet_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pet_data = yield model_pets_1.pets.findOne({
            _id: pet_id,
            is_deleted: false,
        });
        return pet_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findPet = findPet;
const findService = (service_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const service_data = yield model_services_1.services.findOne({
            _id: service_id,
            is_deleted: false,
        });
        return service_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findService = findService;
const findUsersCommunity = (user_id, community_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const community_data = yield model_communities_1.communities.findOne({
            _id: community_id,
            user_id: user_id,
            is_deleted: false,
        });
        return community_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findUsersCommunity = findUsersCommunity;
const incMultipleUserNotificationBadge = (user_ids) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const update_data = yield model_users_1.users.updateMany({
            _id: { $in: user_ids },
            is_deleted: false,
        }, {
            $inc: {
                notification_badge: 1,
            },
        });
        return update_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.incMultipleUserNotificationBadge = incMultipleUserNotificationBadge;
const findCommunityAlbums = (user_id, community_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const community_data = yield model_communities_albums_1.communities_albums.find({
            user_id: user_id,
            community_id: community_id,
        });
        return community_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findCommunityAlbums = findCommunityAlbums;
const findCommunityAlbumById = (album_id, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const album_data_by_id = yield model_communities_albums_1.communities_albums.findOne({
            _id: album_id,
            user_id: user_id,
        });
        return album_data_by_id;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findCommunityAlbumById = findCommunityAlbumById;
const findExistingPayment = (user_id, pet_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const payment_data = yield model_payments_1.payments.findOne({
            user_id: user_id,
            pet_id: pet_id,
        });
        return payment_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findExistingPayment = findExistingPayment;
const incNotificationBadge = (user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const update_data = yield model_users_1.users.updateOne({
            _id: user_id,
            is_deleted: false,
        }, {
            $inc: {
                notification_badge: 1,
            },
        });
        return update_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.incNotificationBadge = incNotificationBadge;
const findExistingReport = (user_id, reported_user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const report_data = yield model_report_users_1.report_users.findOne({
            user_id: user_id,
            reported_user_id: reported_user_id,
        });
        return report_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findExistingReport = findExistingReport;
const findReview = (review_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const review_data = yield model_user_reviews_1.user_reviews.findOne({
            _id: review_id,
        });
        return review_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findReview = findReview;
const findOwnReview = (user_id, review_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const review_data = yield model_user_reviews_1.user_reviews.findOne({
            _id: review_id,
            user_id: user_id,
        });
        return review_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findOwnReview = findOwnReview;
const findExistingReview = (user_id, reviewed_user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const review_data = yield model_user_reviews_1.user_reviews.findOne({
            user_id: user_id,
            reviewed_user_id: reviewed_user_id,
        });
        return review_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findExistingReview = findExistingReview;
const findPetLike = (user_id, pet_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pet_data = yield model_pet_likes_1.pet_likes.findOne({
            user_id: user_id,
            pet_id: pet_id,
        });
        return pet_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findPetLike = findPetLike;
const findUsersPet = (user_id, pet_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pet_data = yield model_pets_1.pets.findOne({
            _id: pet_id,
            user_id: user_id,
            is_deleted: false,
        });
        return pet_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findUsersPet = findUsersPet;
const findPetAlbums = (user_id, pet_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const pet_data = yield model_pet_albums_1.pet_albums.find({
            user_id: user_id,
            pet_id: pet_id,
        });
        return pet_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findPetAlbums = findPetAlbums;
const findPetAlbumById = (album_id, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const album_data_by_id = yield model_pet_albums_1.pet_albums.findOne({
            _id: album_id,
            user_id: user_id,
        });
        return album_data_by_id;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findPetAlbumById = findPetAlbumById;
const findServiceLike = (user_id, service_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const service_data = yield model_service_likes_1.service_likes.findOne({
            user_id: user_id,
            service_id: service_id,
        });
        return service_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findServiceLike = findServiceLike;
const findUsersService = (user_id, service_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const service_data = yield model_services_1.services.findOne({
            _id: service_id,
            user_id: user_id,
            is_deleted: false,
        });
        return service_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findUsersService = findUsersService;
const findServiceAlbums = (user_id, service_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const service_data = yield model_service_albums_1.service_albums.find({
            user_id: user_id,
            service_id: service_id,
        });
        return service_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findServiceAlbums = findServiceAlbums;
const findServiceAlbumById = (album_id, user_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const album_data_by_id = yield model_service_albums_1.service_albums.findOne({
            _id: album_id,
            user_id: user_id,
        });
        return album_data_by_id;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findServiceAlbumById = findServiceAlbumById;
const findChatRoom = (chat_room_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const chat_room_data = yield model_chat_rooms_1.chat_rooms.findOne({
            _id: chat_room_id,
        });
        return chat_room_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findChatRoom = findChatRoom;
const findMessage = (chat_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const [findChat] = yield model_chats_1.chats.aggregate([
            {
                $match: {
                    _id: new mongoose_1.default.Types.ObjectId(chat_id),
                },
            },
            {
                $addFields: {
                    media_file: {
                        $map: {
                            input: "$media_file",
                            as: "media",
                            in: {
                                $mergeObjects: [
                                    "$$media",
                                    {
                                        file_path: {
                                            $cond: [
                                                { $ne: ["$$media.file_path", null] },
                                                {
                                                    $concat: [process.env.BASE_URL, "$$media.file_path"],
                                                },
                                                "$$media.file_path",
                                            ],
                                        },
                                        thumbnail_name: "$$media.thumbnail",
                                        thumbnail: {
                                            $cond: [
                                                {
                                                    $and: [
                                                        { $eq: ["$$media.file_type", "video"] },
                                                        { $ne: ["$$media.thumbnail", null] },
                                                    ],
                                                },
                                                {
                                                    $concat: [process.env.BASE_URL, "$$media.thumbnail"],
                                                },
                                                "$$media.thumbnail",
                                            ],
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    _id: 1,
                    chat_room_id: 1,
                    sender_id: 1,
                    receiver_id: 1,
                    message_time: 1,
                    message: 1,
                    message_type: 1,
                    is_edited: 1,
                    media_file: 1,
                    is_delete_everyone: 1,
                    is_delete_by: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ]);
        return findChat;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findMessage = findMessage;
const escapeRegex = (text) => {
    return text.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
};
exports.escapeRegex = escapeRegex;
const objectId = (id) => {
    return new mongoose_1.default.Types.ObjectId(id);
};
exports.objectId = objectId;
const findContentByType = (content_type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const content_data = yield model_app_contents_1.app_contents.findOne({
            content_type: content_type,
            is_deleted: false,
        });
        return content_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findContentByType = findContentByType;
const findContent = (content_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const content_data = yield model_app_contents_1.app_contents.findOne({
            _id: content_id,
            is_deleted: false,
        });
        return content_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findContent = findContent;
const findFaqByName = (question) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const faq_data = yield model_faqs_1.faqs.findOne({
            question: question,
        });
        return faq_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findFaqByName = findFaqByName;
const findFaq = (faq_id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const faq_data = yield model_faqs_1.faqs.findOne({
            _id: faq_id,
        });
        return faq_data;
    }
    catch (error) {
        console.log("Error : ", error);
        return (0, response_functions_1.InternalErrorRes)();
    }
});
exports.findFaq = findFaq;

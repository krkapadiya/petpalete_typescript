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
exports.changeScreenStatus = exports.deleteChatRoom = exports.updatedChatRoomData = exports.chatUserList = exports.readMessage = exports.deleteMessageForEveryOne = exports.deleteMessage = exports.editMessage = exports.getAllMessage = exports.sendMessage = exports.createRoom = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const i18n_1 = __importDefault(require("i18n"));
const date_formats_1 = require("../../util/date_formats");
const model_user_sessions_1 = require("../../api/model/model.user_sessions");
const model_chats_1 = require("../../api/model/model.chats");
const model_chat_rooms_1 = require("../../api/model/model.chat_rooms");
const model_notifications_1 = require("../../api/model/model.notifications");
const send_notifications_1 = require("../../util/send_notifications");
const response_functions_1 = require("../../util/response_functions");
const user_function_1 = require("../../util/user_function");
const bucket_manager_1 = require("../../util/bucket_manager");
const createRoom = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, other_user_id, ln = "en" } = data;
        i18n_1.default.setLocale(ln);
        const userObjectId = new mongoose_1.default.Types.ObjectId(user_id);
        const otherUserObjectId = new mongoose_1.default.Types.ObjectId(other_user_id);
        const cond1 = {
            user_id: userObjectId,
            other_user_id: otherUserObjectId,
            is_deleted: false,
        };
        const cond2 = {
            user_id: otherUserObjectId,
            other_user_id: userObjectId,
            is_deleted: false,
        };
        const findRoom = yield model_chat_rooms_1.chat_rooms.findOne({
            $or: [cond1, cond2],
        });
        let chat_room_id;
        if (findRoom) {
            chat_room_id = findRoom._id;
            const findChatDeleteByUser = yield model_chat_rooms_1.chat_rooms.findOne({
                _id: findRoom._id,
                is_delete_by: { $eq: user_id },
            });
            if (findChatDeleteByUser) {
                yield model_chat_rooms_1.chat_rooms.findByIdAndUpdate(findRoom._id, {
                    $pull: { is_delete_by: user_id },
                }, { new: true });
            }
        }
        else {
            const createData = {
                user_id: userObjectId,
                other_user_id: otherUserObjectId,
            };
            const createNewRoom = yield model_chat_rooms_1.chat_rooms.create(createData);
            chat_room_id = createNewRoom._id;
        }
        // let [ChatRoomData] = await chat_rooms.aggregate([
        //     {
        //         $match: {
        //             _id: new mongoose.Types.ObjectId(chat_room_id),
        //         },
        //     },
        //     {
        //         $addFields: {
        //             user_id: userObjectId,
        //             other_user_id: otherUserObjectId
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "users", // Assuming "users" collection for user_id
        //             localField: "user_id",
        //             foreignField: "_id",
        //             as: "user_id",
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "user_albums",
        //             let: { localId: "$user_id" },
        //             pipeline: [
        //                 {
        //                     $match: {
        //                         $expr: {
        //                             $and: [
        //                                 { $eq: ["$user_id", "$$localId"] },
        //                                 { $eq: ["$album_type", "image"] },
        //                             ]
        //                         }
        //                     }
        //                 }
        //             ],
        //             as: "user_media",
        //         }
        //     },
        //     {
        //         $lookup: {
        //             from: "users",
        //             localField: "other_user_id",
        //             foreignField: "_id",
        //             as: "other_user_id",
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "user_albums",
        //             let: { localId: "$other_user_id" },
        //             pipeline: [
        //                 {
        //                     $match: {
        //                         $expr: {
        //                             $and: [
        //                                 { $eq: ["$user_id", "$$localId"] },
        //                                 { $eq: ["$album_type", "image"] },
        //                             ]
        //                         }
        //                     }
        //                 }
        //             ],
        //             as: "other_user_media",
        //         }
        //     },
        //     {
        //         $unwind: {
        //             path: "$user_id",
        //             preserveNullAndEmptyArrays: true,
        //         },
        //     },
        //     {
        //         $unwind: {
        //             path: "$other_user_id",
        //             preserveNullAndEmptyArrays: true,
        //         },
        //     },
        //     {
        //         $lookup: {
        //             from: "user_sessions",
        //             let: { userId: "$other_user" },
        //             pipeline: [
        //                 {
        //                     $match: {
        //                         $expr: {
        //                             $and: [
        //                                 { $eq: ["$user_id", "$$userId"] },
        //                                 { $ne: ["$socket_id", null] },
        //                                 { $eq: ["$is_active", true] },
        //                                 { $eq: ["$is_deleted", false] },
        //                             ],
        //                         },
        //                     },
        //                 },
        //                 { $limit: 1 },
        //             ],
        //             as: "online_status",
        //         },
        //     },
        //     {
        //         $addFields: {
        //             user_profile_picture: {
        //                 $cond: {
        //                     if: { $gt: [{ $size: "$user_media" }, 0] },
        //                     then: { $concat: [process.env.BUCKET_URL, { $arrayElemAt: ["$user_media.album_path", 0] }] },
        //                     else: null
        //                 }
        //             },
        //             other_user_profile_picture: {
        //                 $cond: {
        //                     if: { $gt: [{ $size: "$other_user_media" }, 0] },
        //                     then: { $concat: [process.env.BUCKET_URL, { $arrayElemAt: ["$other_user_media.album_path", 0] }] },
        //                     else: null
        //                 }
        //             },
        //             is_online: { $gt: [{ $size: "$online_status" }, 0] },
        //             user_id: "$user_id._id",
        //             user_full_name: "$user_id.full_name",
        //             other_user_id: "$other_user_id._id",
        //             other_user_full_name: "$other_user_id.full_name",
        //         },
        //     },
        //     {
        //         $project: {
        //             _id: 1,
        //             user_id: 1,
        //             user_full_name: 1,
        //             user_profile_picture: 1,
        //             other_user_id: 1,
        //             other_user_full_name: 1,
        //             other_user_profile_picture: 1,
        //             is_online: 1
        //         },
        //     },
        // ]);
        const [ChatRoomData] = yield model_chat_rooms_1.chat_rooms.aggregate([
            {
                $match: {
                    _id: typeof chat_room_id === "string"
                        ? new mongoose_1.default.Types.ObjectId(chat_room_id)
                        : chat_room_id,
                },
            },
            {
                $lookup: {
                    from: "chats",
                    localField: "_id",
                    foreignField: "chat_room_id",
                    as: "chat_data",
                },
            },
            {
                $addFields: {
                    other_user: {
                        $cond: {
                            if: { $eq: ["$user_id", userObjectId] },
                            then: "$other_user_id",
                            else: "$user_id",
                        },
                    },
                    current_user: userObjectId,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "other_user",
                    foreignField: "_id",
                    as: "other_user_data",
                },
            },
            {
                $unwind: {
                    path: "$other_user_data",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "user_albums",
                    let: { localId: "$other_user_data._id" },
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
                    from: "chats",
                    let: {
                        roomId: "$_id",
                        userId: new mongoose_1.default.Types.ObjectId(user_id),
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$chat_room_id", "$$roomId"] },
                                        { $not: { $in: [userObjectId, "$is_delete_by"] } },
                                        { $eq: ["$is_delete_everyone", false] },
                                        {
                                            $or: [
                                                { $eq: ["$sender_id", "$$userId"] },
                                                { $eq: ["$receiver_id", "$$userId"] },
                                            ],
                                        },
                                        { $ne: ["$is_delete_by", "$$userId"] },
                                    ],
                                },
                            },
                        },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 },
                    ],
                    as: "last_message",
                },
            },
            {
                $unwind: {
                    path: "$last_message",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "chats",
                    let: { roomId: "$_id", userId: userObjectId },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$chat_room_id", "$$roomId"] },
                                        { $eq: ["$receiver_id", "$$userId"] },
                                        { $ne: ["$is_read", true] },
                                        { $eq: ["$is_delete_everyone", false] },
                                        { $not: { $in: [userObjectId, "$is_delete_by"] } },
                                    ],
                                },
                            },
                        },
                        { $count: "unread_count" },
                    ],
                    as: "unread_messages",
                },
            },
            {
                $addFields: {
                    unread_count: {
                        $ifNull: [
                            {
                                $arrayElemAt: ["$unread_messages.unread_count", 0],
                            },
                            0,
                        ],
                    },
                },
            },
            {
                $lookup: {
                    from: "user_sessions",
                    let: { userId: "$other_user_data._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", "$$userId"] },
                                        { $ne: ["$socket_id", null] },
                                        { $eq: ["$is_active", true] },
                                    ],
                                },
                            },
                        },
                        { $limit: 1 },
                    ],
                    as: "online_status",
                },
            },
            {
                $addFields: {
                    user_id: "$other_user_data._id",
                    is_deleted: "$other_user_data.is_deleted",
                    profile_picture: {
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
                    // is_online: { $gt: [{ $size: "$online_status" }, 0] },
                    is_online: {
                        $cond: {
                            if: { $gt: [{ $size: "$online_status" }, 0] },
                            then: true,
                            else: false,
                        },
                    },
                    full_name: "$other_user_data.full_name",
                    last_msg: "$last_message.message",
                    last_msg_time: { $ifNull: ["$last_message.message_time", null] },
                    last_msg_type: { $ifNull: ["$last_message.message_type", null] },
                },
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    is_deleted: 1,
                    unread_count: 1,
                    profile_picture: 1,
                    is_online: 1,
                    full_name: 1,
                    last_msg: 1,
                    last_msg_time: 1,
                    last_msg_type: 1,
                    createdAt: 1,
                },
            },
        ]);
        return (0, response_functions_1.socketSuccessRes)(i18n_1.default.__("Chat room created successfully"), ChatRoomData);
    }
    catch (error) {
        console.log("createRoom Error EMIT:", error instanceof Error ? error.message : String(error));
        return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
    }
});
exports.createRoom = createRoom;
const sendMessage = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { sender_id, chat_room_id, receiver_id, message, message_type, media_file, ln = "en", } = data;
        i18n_1.default.setLocale(ln);
        const currentDateTime = yield (0, date_formats_1.dateTime)();
        const senderObjectId = new mongoose_1.default.Types.ObjectId(sender_id);
        const findChatRoomExists = yield (0, user_function_1.findChatRoom)(chat_room_id);
        if (!findChatRoomExists) {
            return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Chat room not found"));
        }
        let insertData = {
            chat_room_id: chat_room_id,
            sender_id: sender_id,
            receiver_id: receiver_id,
            message_time: currentDateTime,
            message: message,
            message_type: message_type,
        };
        const media_file_array = [];
        if (message_type === "media") {
            for (const value of media_file) {
                const files = {
                    file_type: value.file_type,
                    file_path: value.file_path,
                    file_name: value.file_name,
                    thumbnail: value.thumbnail || null,
                };
                media_file_array.push(files);
            }
        }
        if (media_file_array.length > 0) {
            insertData = Object.assign(Object.assign({}, insertData), { media_file: media_file_array });
        }
        const receiverIsOnline = yield model_user_sessions_1.user_sessions.findOne({
            user_id: receiver_id,
            is_active: true,
            chat_room_id: chat_room_id,
        });
        if (receiverIsOnline) {
            insertData = Object.assign(Object.assign({}, insertData), { is_read: true });
        }
        const createdChat = yield model_chats_1.chats.create(insertData);
        const findSender = yield (0, user_function_1.findUser)(senderObjectId.toString());
        if (!findSender) {
            console.error("Sender not found:", senderObjectId.toString());
            return (0, response_functions_1.InternalErrorRes)();
        }
        if (!receiverIsOnline) {
            const noti_title = findSender.full_name || "";
            let noti_msg;
            if (message_type === "media") {
                noti_msg = `sent a media 🎥📸`;
            }
            else {
                noti_msg = message;
            }
            const noti_for = "chat_notification";
            let notiData = {
                device_token: [],
                noti_title: findSender.full_name || "",
                noti_msg,
                noti_for,
                id: chat_room_id,
                chat_room_id,
                sender_id,
                sound_name: "default",
            };
            const findDeviceTokens = yield model_user_sessions_1.user_sessions.find({
                user_id: receiver_id,
            });
            const deviceTokenArray = findDeviceTokens.map((row) => row.device_token);
            if (deviceTokenArray.length > 0) {
                notiData = Object.assign(Object.assign({}, notiData), { device_token: deviceTokenArray });
                (0, send_notifications_1.multiNotificationSend)(notiData);
                (0, user_function_1.incNotificationBadge)(receiver_id);
            }
            const inAppNotificationData = {
                sender_id: sender_id,
                receiver_id: receiver_id,
                chat_room_id: chat_room_id,
                chat_id: createdChat._id,
                noti_msg,
                noti_title: `New Message from ${noti_title}!`,
                noti_for,
                sound_name: "default",
            };
            yield model_notifications_1.notifications.create(inAppNotificationData);
        }
        const [findMessage] = yield model_chats_1.chats.aggregate([
            {
                $match: {
                    _id: createdChat._id,
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
                                                    $concat: [
                                                        process.env.BUCKET_URL,
                                                        "$$media.file_path",
                                                    ],
                                                },
                                                "$$media.file_path",
                                            ],
                                        },
                                        thumbnail: {
                                            $cond: [
                                                {
                                                    $and: [
                                                        { $eq: ["$$media.file_type", "video"] },
                                                        { $ne: ["$$media.thumbnail", null] },
                                                    ],
                                                },
                                                {
                                                    $concat: [
                                                        process.env.BUCKET_URL,
                                                        "$$media.thumbnail",
                                                    ],
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
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ]);
        const findChatDeleteByUser = yield model_chat_rooms_1.chat_rooms.findOne({
            _id: chat_room_id,
            $or: [
                { is_delete_by: { $eq: receiver_id } },
                { is_delete_by: { $eq: sender_id } },
            ],
        });
        if (findChatDeleteByUser) {
            yield model_chat_rooms_1.chat_rooms.findByIdAndUpdate(chat_room_id, {
                $set: { is_delete_by: [] },
            }, { new: true });
        }
        return (0, response_functions_1.socketSuccessRes)(i18n_1.default.__("Message sent successfully"), findMessage);
    }
    catch (error) {
        console.log("sendMessage Error EMIT:", error);
        return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
    }
});
exports.sendMessage = sendMessage;
const getAllMessage = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chat_room_id, user_id, page = 1, limit = 10, ln = "en" } = data;
        i18n_1.default.setLocale(ln);
        const chatRoomObjectId = new mongoose_1.default.Types.ObjectId(chat_room_id);
        const userObjectId = new mongoose_1.default.Types.ObjectId(user_id);
        const findChatRoomExists = yield (0, user_function_1.findChatRoom)(chatRoomObjectId.toString());
        if (!findChatRoomExists) {
            return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Chat room not found"));
        }
        const findAllMessages = yield model_chats_1.chats.aggregate([
            {
                $match: {
                    chat_room_id: chatRoomObjectId,
                    is_delete_everyone: false,
                    is_delete_by: { $ne: userObjectId },
                },
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
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
                                                    $concat: [
                                                        process.env.BUCKET_URL,
                                                        "$$media.file_path",
                                                    ],
                                                },
                                                "$$media.file_path",
                                            ],
                                        },
                                        thumbnail: {
                                            $cond: [
                                                {
                                                    $and: [
                                                        { $eq: ["$$media.file_type", "video"] },
                                                        { $ne: ["$$media.thumbnail", null] },
                                                    ],
                                                },
                                                {
                                                    $concat: [
                                                        process.env.BUCKET_URL,
                                                        "$$media.thumbnail",
                                                    ],
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
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ]);
        return (0, response_functions_1.socketSuccessRes)(i18n_1.default.__("Messages get successfully"), findAllMessages);
    }
    catch (error) {
        console.log("getAllMessage Error EMIT:", error instanceof Error ? error.message : String(error));
        return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
    }
});
exports.getAllMessage = getAllMessage;
const editMessage = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chat_id, chat_room_id, user_id, message, ln = "en" } = data;
        i18n_1.default.setLocale(ln);
        const chatObjectId = new mongoose_1.default.Types.ObjectId(chat_id);
        const chatRoomObjectId = new mongoose_1.default.Types.ObjectId(chat_room_id);
        const userObjectId = new mongoose_1.default.Types.ObjectId(user_id);
        const find_message = yield (0, user_function_1.findMessage)(chatObjectId.toString());
        if (!find_message) {
            return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Message not find"));
        }
        if (find_message.sender_id.toString() !== userObjectId.toString()) {
            return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("You do not have permission to edit this message"));
        }
        yield model_chats_1.chats.updateOne({
            _id: chatObjectId,
            chat_room_id: chatRoomObjectId,
            sender_id: userObjectId,
        }, {
            $set: {
                message: message,
                is_edited: true,
            },
        });
        const editedMessage = yield (0, user_function_1.findMessage)(chatObjectId.toString());
        const lastMessage = yield model_chats_1.chats
            .findOne({
            chat_room_id: chat_room_id,
        })
            .sort({
            createdAt: -1,
        });
        let isLastMessage = false;
        if (lastMessage && lastMessage._id instanceof mongoose_1.default.Types.ObjectId) {
            isLastMessage = true;
        }
        return (0, response_functions_1.socketSuccessRes)(i18n_1.default.__("Message edited successfully"), Object.assign(Object.assign({}, editedMessage), { isLastMessage }));
    }
    catch (error) {
        console.log("editMessage Error EMIT:", error instanceof Error ? error.message : String(error));
        return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
    }
});
exports.editMessage = editMessage;
const deleteMessage = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chat_room_id, chat_id, user_id, ln = "en" } = data;
        i18n_1.default.setLocale(ln);
        const chatObjectId = new mongoose_1.default.Types.ObjectId(chat_id);
        const find_message = yield (0, user_function_1.findMessage)(chatObjectId.toString());
        if (!find_message) {
            return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Message not find"));
        }
        const delete_data = { is_delete_by: user_id };
        yield model_chats_1.chats
            .updateOne({ _id: find_message._id }, { $push: delete_data })
            .where({ is_delete_by: { $ne: user_id } });
        const updatedMessage = yield (0, user_function_1.findMessage)(chatObjectId.toString());
        if (updatedMessage && updatedMessage.message_type === "media") {
            if (updatedMessage.is_delete_by.length === 2) {
                updatedMessage.media_file.map((media) => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        if (media.thumbnail_name) {
                            yield (0, bucket_manager_1.removeMediaFromS3Bucket)(media.thumbnail_name);
                        }
                        const file_name = `socket_media/${media.file_name}`;
                        yield (0, bucket_manager_1.removeMediaFromS3Bucket)(file_name);
                    }
                    catch (error) {
                        console.log("failed to delete media from s3", error);
                    }
                }));
            }
        }
        return (0, response_functions_1.socketSuccessRes)("Chat deleted successfully", {
            chat_room_id: chat_room_id,
            chat_id: chat_id,
            user_id: user_id,
        });
    }
    catch (error) {
        console.log("deleteMessage Error EMIT:", error instanceof Error ? error.message : String(error));
        return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
    }
});
exports.deleteMessage = deleteMessage;
const deleteMessageForEveryOne = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chat_room_id, chat_id, user_id, ln = "en" } = data;
        i18n_1.default.setLocale(ln);
        const chatObjectId = new mongoose_1.default.Types.ObjectId(chat_id);
        const findMessageData = yield (0, user_function_1.findMessage)(chatObjectId.toString());
        if (!findMessageData) {
            return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Message not find"));
        }
        if (findMessageData.sender_id.toString() !== user_id.toString()) {
            return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("You do not have permission to delete this message"));
        }
        yield model_chats_1.chats.updateOne({ _id: findMessageData._id }, { $set: { is_delete_everyone: true } });
        const updatedMessage = yield (0, user_function_1.findMessage)(chatObjectId.toString());
        if (updatedMessage && updatedMessage.message_type === "media") {
            console.log(updatedMessage && updatedMessage.message_type === "media");
            if (updatedMessage.is_delete_everyone === true) {
                updatedMessage.media_file.map((media) => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        if (media.thumbnail_name) {
                            yield (0, bucket_manager_1.removeMediaFromS3Bucket)(media.thumbnail_name);
                        }
                        const file_name = `socket_media/${media.file_name}`;
                        yield (0, bucket_manager_1.removeMediaFromS3Bucket)(file_name);
                    }
                    catch (error) {
                        console.log("failed to delete media from s3", error);
                    }
                }));
            }
        }
        yield model_notifications_1.notifications.deleteMany({
            chat_room_id: chat_room_id,
            chat_id: chat_id,
        });
        const lastMessage = yield model_chats_1.chats
            .findOne({
            chat_room_id: chat_room_id,
        })
            .sort({
            createdAt: -1,
        });
        let isLastMessage = false;
        if (lastMessage &&
            updatedMessage &&
            lastMessage._id &&
            updatedMessage._id) {
            isLastMessage =
                lastMessage._id.toString() === updatedMessage._id.toString();
        }
        return (0, response_functions_1.socketSuccessRes)("Chat deleted successfully", Object.assign(Object.assign({}, updatedMessage), { isLastMessage }));
    }
    catch (error) {
        console.log("deleteMessage Error EMIT:", error instanceof Error ? error.message : String(error));
        return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
    }
});
exports.deleteMessageForEveryOne = deleteMessageForEveryOne;
const readMessage = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chat_room_id, user_id, ln = "en" } = data;
        i18n_1.default.setLocale(ln);
        const chatRoomObjectId = new mongoose_1.default.Types.ObjectId(chat_room_id);
        const userObjectId = new mongoose_1.default.Types.ObjectId(user_id);
        yield model_chats_1.chats.updateMany({
            chat_room_id: chatRoomObjectId,
            receiver_id: userObjectId,
            is_read: false,
        }, {
            $set: {
                is_read: true,
            },
        });
        return (0, response_functions_1.socketSuccessRes)(i18n_1.default.__("Messages read successfully"), {
            chat_room_id,
        });
    }
    catch (error) {
        console.log("readMessage Error EMIT:", error instanceof Error ? error.message : String(error));
        return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
    }
});
exports.readMessage = readMessage;
const chatUserList = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, search = "", page = 1, limit = 10, ln = "en" } = data;
        i18n_1.default.setLocale(ln);
        const escapedSearch = search ? yield (0, user_function_1.escapeRegex)(search) : null;
        const userObjectId = new mongoose_1.default.Types.ObjectId(user_id);
        const matchCondition = {
            $or: [{ user_id: userObjectId }, { other_user_id: userObjectId }],
            is_delete_by: { $ne: new mongoose_1.default.Types.ObjectId(user_id) },
            is_deleted: false,
        };
        const findAllRooms = yield model_chat_rooms_1.chat_rooms.aggregate([
            {
                $match: matchCondition,
            },
            {
                $lookup: {
                    from: "chats",
                    localField: "_id",
                    foreignField: "chat_room_id",
                    as: "chat_data",
                },
            },
            {
                $match: {
                    $expr: { $gt: [{ $size: "$chat_data" }, 0] }, // Ensures chat_data has at least one message
                },
            },
            {
                $addFields: {
                    other_user: {
                        $cond: {
                            if: { $eq: ["$user_id", userObjectId] },
                            then: "$other_user_id",
                            else: "$user_id",
                        },
                    },
                    current_user: userObjectId,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "other_user",
                    foreignField: "_id",
                    as: "other_user_data",
                },
            },
            {
                $unwind: {
                    path: "$other_user_data",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "user_albums",
                    let: { localId: "$other_user_data._id" },
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
                $match: escapedSearch
                    ? {
                        "other_user_data.full_name": {
                            $regex: escapedSearch,
                            $options: "i",
                        },
                    }
                    : {},
            },
            {
                $lookup: {
                    from: "chats",
                    let: {
                        roomId: "$_id",
                        userId: new mongoose_1.default.Types.ObjectId(user_id),
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$chat_room_id", "$$roomId"] },
                                        { $not: { $in: [userObjectId, "$is_delete_by"] } },
                                        { $eq: ["$is_delete_everyone", false] },
                                        {
                                            $or: [
                                                { $eq: ["$sender_id", "$$userId"] },
                                                { $eq: ["$receiver_id", "$$userId"] },
                                            ],
                                        },
                                        { $ne: ["$is_delete_by", "$$userId"] },
                                    ],
                                },
                            },
                        },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 },
                    ],
                    as: "last_message",
                },
            },
            {
                $unwind: {
                    path: "$last_message",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "chats",
                    let: { roomId: "$_id", userId: userObjectId },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$chat_room_id", "$$roomId"] },
                                        { $eq: ["$receiver_id", "$$userId"] },
                                        { $ne: ["$is_read", true] },
                                        { $eq: ["$is_delete_everyone", false] },
                                        { $not: { $in: [userObjectId, "$is_delete_by"] } },
                                    ],
                                },
                            },
                        },
                        { $count: "unread_count" },
                    ],
                    as: "unread_messages",
                },
            },
            {
                $addFields: {
                    unread_count: {
                        $ifNull: [
                            {
                                $arrayElemAt: ["$unread_messages.unread_count", 0],
                            },
                            0,
                        ],
                    },
                },
            },
            {
                $sort: {
                    "last_message.message_time": -1,
                },
            },
            {
                $skip: (page - 1) * limit,
            },
            {
                $limit: limit,
            },
            {
                $lookup: {
                    from: "user_sessions",
                    let: { userId: "$other_user_data._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", "$$userId"] },
                                        { $ne: ["$socket_id", null] },
                                        { $eq: ["$is_active", true] },
                                    ],
                                },
                            },
                        },
                        { $limit: 1 },
                    ],
                    as: "online_status",
                },
            },
            {
                $addFields: {
                    user_id: "$other_user_data._id",
                    is_deleted: "$other_user_data.is_deleted",
                    profile_picture: {
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
                    // is_online: { $gt: [{ $size: "$online_status" }, 0] },
                    is_online: {
                        $cond: {
                            if: { $gt: [{ $size: "$online_status" }, 0] },
                            then: true,
                            else: false,
                        },
                    },
                    full_name: "$other_user_data.full_name",
                    last_msg: "$last_message.message",
                    last_msg_time: { $ifNull: ["$last_message.message_time", null] },
                    last_msg_type: { $ifNull: ["$last_message.message_type", null] },
                },
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    is_deleted: 1,
                    unread_count: 1,
                    profile_picture: 1,
                    is_online: 1,
                    full_name: 1,
                    last_msg: 1,
                    last_msg_time: 1,
                    last_msg_type: 1,
                    createdAt: 1,
                },
            },
        ]);
        return (0, response_functions_1.socketSuccessRes)(i18n_1.default.__("User list get successfully"), findAllRooms);
    }
    catch (error) {
        console.log("chatUserList Error EMIT:", error instanceof Error ? error.message : String(error));
        return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
    }
});
exports.chatUserList = chatUserList;
const updatedChatRoomData = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, chat_room_id, ln = "en" } = data;
        i18n_1.default.setLocale(ln);
        const userObjectId = new mongoose_1.default.Types.ObjectId(user_id);
        const chatObjectId = new mongoose_1.default.Types.ObjectId(chat_room_id);
        const matchCondition = {
            _id: chatObjectId,
            is_deleted: false,
        };
        const [findRoom] = yield model_chat_rooms_1.chat_rooms.aggregate([
            {
                $match: matchCondition,
            },
            {
                $lookup: {
                    from: "chats",
                    localField: "_id",
                    foreignField: "chat_room_id",
                    as: "chat_data",
                },
            },
            {
                $addFields: {
                    other_user: {
                        $cond: {
                            if: { $eq: ["$user_id", userObjectId] },
                            then: "$other_user_id",
                            else: "$user_id",
                        },
                    },
                    current_user: userObjectId,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "other_user",
                    foreignField: "_id",
                    as: "other_user_data",
                },
            },
            {
                $unwind: {
                    path: "$other_user_data",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "user_albums",
                    let: { localId: "$other_user_data._id" },
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
                    from: "chats",
                    let: {
                        roomId: "$_id",
                        userId: new mongoose_1.default.Types.ObjectId(user_id),
                    },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$chat_room_id", "$$roomId"] },
                                        { $not: { $in: [userObjectId, "$is_delete_by"] } },
                                        { $eq: ["$is_delete_everyone", false] },
                                        {
                                            $or: [
                                                { $eq: ["$sender_id", "$$userId"] },
                                                { $eq: ["$receiver_id", "$$userId"] },
                                            ],
                                        },
                                        { $ne: ["$is_delete_by", "$$userId"] },
                                    ],
                                },
                            },
                        },
                        { $sort: { createdAt: -1 } },
                        { $limit: 1 },
                    ],
                    as: "last_message",
                },
            },
            {
                $unwind: {
                    path: "$last_message",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "chats",
                    let: { roomId: "$_id", userId: userObjectId },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$chat_room_id", "$$roomId"] },
                                        { $eq: ["$receiver_id", "$$userId"] },
                                        { $ne: ["$is_read", true] },
                                        { $eq: ["$is_delete_everyone", false] },
                                        { $not: { $in: [userObjectId, "$is_delete_by"] } },
                                    ],
                                },
                            },
                        },
                        { $count: "unread_count" },
                    ],
                    as: "unread_messages",
                },
            },
            {
                $addFields: {
                    unread_count: {
                        $ifNull: [
                            {
                                $arrayElemAt: ["$unread_messages.unread_count", 0],
                            },
                            0,
                        ],
                    },
                },
            },
            {
                $lookup: {
                    from: "user_sessions",
                    let: { userId: "$other_user_data._id" },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [
                                        { $eq: ["$user_id", "$$userId"] },
                                        { $ne: ["$socket_id", null] },
                                        { $eq: ["$is_active", true] },
                                    ],
                                },
                            },
                        },
                        { $limit: 1 },
                    ],
                    as: "online_status",
                },
            },
            {
                $addFields: {
                    user_id: "$other_user_data._id",
                    is_deleted: "$other_user_data.is_deleted",
                    profile_picture: {
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
                    // is_online: { $gt: [{ $size: "$online_status" }, 0] },
                    is_online: {
                        $cond: {
                            if: { $gt: [{ $size: "$online_status" }, 0] },
                            then: true,
                            else: false,
                        },
                    },
                    full_name: "$other_user_data.full_name",
                    last_msg: "$last_message.message",
                    last_msg_time: { $ifNull: ["$last_message.message_time", null] },
                    last_msg_type: { $ifNull: ["$last_message.message_type", null] },
                },
            },
            {
                $project: {
                    _id: 1,
                    user_id: 1,
                    is_deleted: 1,
                    unread_count: 1,
                    profile_picture: 1,
                    is_online: 1,
                    full_name: 1,
                    last_msg: 1,
                    last_msg_time: 1,
                    last_msg_type: 1,
                    createdAt: 1,
                },
            },
        ]);
        return (0, response_functions_1.socketSuccessRes)(i18n_1.default.__("chat room data get successfully"), findRoom);
    }
    catch (error) {
        console.log("updatedChatRoomData Error EMIT:", error instanceof Error ? error.message : String(error));
        return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
    }
});
exports.updatedChatRoomData = updatedChatRoomData;
const deleteChatRoom = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { chat_room_id, user_id, ln = "en" } = data;
        i18n_1.default.setLocale(ln);
        const chatRoomObjectId = new mongoose_1.default.Types.ObjectId(chat_room_id);
        const findChatRoomExists = yield (0, user_function_1.findChatRoom)(chatRoomObjectId.toString());
        if (!findChatRoomExists) {
            return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Message not find"));
        }
        const delete_data = { is_delete_by: user_id };
        yield model_chats_1.chats
            .updateMany({ chat_room_id: chat_room_id }, { $push: delete_data })
            .where({ is_delete_by: { $ne: user_id } });
        yield model_chat_rooms_1.chat_rooms
            .updateOne({ _id: chat_room_id }, { $push: delete_data })
            .where({ is_delete_by: { $ne: user_id } });
        return (0, response_functions_1.socketSuccessRes)(i18n_1.default.__("Chat deleted successfully"), {
            chat_room_id,
        });
    }
    catch (error) {
        console.log("deleteMessage Error EMIT:", error instanceof Error ? error.message : String(error));
        return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
    }
});
exports.deleteChatRoom = deleteChatRoom;
const changeScreenStatus = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, screen_status, chat_room_id, socket_id } = data;
        const find_chat_room = yield model_chat_rooms_1.chat_rooms.findOne({
            _id: chat_room_id,
            is_deleted: false,
        });
        if (!find_chat_room) {
            return (0, response_functions_1.socketErrorRes)("Chat room not found");
        }
        if (screen_status === "true" || screen_status === true) {
            yield model_user_sessions_1.user_sessions.updateOne({
                user_id: user_id,
                socket_id: socket_id,
            }, {
                $set: {
                    chat_room_id: chat_room_id,
                },
            }, { new: true });
        }
        else {
            yield model_user_sessions_1.user_sessions.updateOne({
                user_id: user_id,
                socket_id: socket_id,
            }, {
                $set: {
                    chat_room_id: null,
                },
            }, { new: true });
        }
        return (0, response_functions_1.socketSuccessRes)("Screen status changed successfully", []);
    }
    catch (error) {
        console.log("changeScreenStatus Error EMIT:", error instanceof Error ? error.message : String(error));
        return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
    }
});
exports.changeScreenStatus = changeScreenStatus;

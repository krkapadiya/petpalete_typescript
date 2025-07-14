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
exports.checkUserIsOnline = exports.disconnectSocket = exports.setSocketId = void 0;
const model_users_1 = require("./../../api/model/model.users");
const model_user_sessions_1 = require("./../../api/model/model.user_sessions");
const model_chat_rooms_1 = require("./../../api/model/model.chat_rooms");
const mongoose_1 = __importDefault(require("mongoose"));
const i18n_1 = __importDefault(require("i18n"));
const response_functions_1 = require("./../../util/response_functions");
const chat_1 = require("./chat");
const setSocketId = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, device_token, socket_id, ln = "en" } = data;
        i18n_1.default.setLocale(ln);
        const user = yield model_users_1.users.findOne({ _id: user_id });
        const match = yield model_user_sessions_1.user_sessions.findOne({
            user_id: new mongoose_1.default.Types.ObjectId(user_id),
            device_token: device_token,
        });
        console.log("Matched session:", match);
        if (user) {
            yield model_user_sessions_1.user_sessions.updateOne({
                user_id: new mongoose_1.default.Types.ObjectId(user_id),
                device_token: device_token,
            }, {
                $set: {
                    socket_id: socket_id,
                    is_active: true,
                },
            }, {
                new: true,
            });
            return (0, response_functions_1.socketSuccessRes)(i18n_1.default.__("Socket id set successfully!"), data);
        }
        else {
            return (0, response_functions_1.socketErrorRes)("User not found!");
        }
    }
    catch (error) {
        console.log("setSocketId error", error instanceof Error ? error.message : String(error));
        return (0, response_functions_1.socketErrorRes)("Something went wrong");
    }
});
exports.setSocketId = setSocketId;
const disconnectSocket = (data, v1version) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { socket_id, ln = "en" } = data;
        i18n_1.default.setLocale(ln);
        const findUserSession = yield model_user_sessions_1.user_sessions.findOne({
            socket_id: socket_id,
        });
        console.log({ findUserSession });
        if (findUserSession) {
            const findUser = yield model_users_1.users.findOne({
                _id: findUserSession.user_id,
                is_deleted: false,
            });
            console.log({ findUser });
            if (findUser) {
                const user_id = findUser._id;
                yield model_user_sessions_1.user_sessions.updateOne({
                    _id: findUserSession._id,
                }, {
                    $set: {
                        is_active: false,
                        socket_id: null,
                        chat_room_id: null,
                    },
                }, { new: true });
                if (findUserSession.chat_room_id !== null) {
                    const findChatRoom = yield model_chat_rooms_1.chat_rooms.findOne({
                        _id: findUserSession.chat_room_id,
                        is_deleted: false,
                    });
                    if (findChatRoom) {
                        const userIsOnlineInChatRoom = yield model_user_sessions_1.user_sessions.find({
                            user_id: findUser._id,
                            chat_room_id: findChatRoom._id,
                            socket_id: { $ne: socket_id },
                            is_active: true,
                        });
                        if (userIsOnlineInChatRoom.length === 0) {
                            const changeStatusData = {
                                chat_room_id: findChatRoom._id,
                                screen_status: false,
                                user_id: findUser._id,
                                socket_id: socket_id,
                            };
                            const changeScreenStatusData = yield (0, chat_1.changeScreenStatus)(Object.assign(Object.assign({}, changeStatusData), { ln: "en" }));
                            if (changeScreenStatusData.success) {
                                v1version
                                    .to(findChatRoom._id)
                                    .emit("changeScreenStatus", changeScreenStatusData);
                            }
                        }
                    }
                }
                const userIsOnline = yield model_user_sessions_1.user_sessions.find({
                    user_id: findUser._id,
                    is_active: true,
                });
                if (userIsOnline.length === 0) {
                    yield model_users_1.users.updateOne({
                        _id: findUser._id,
                    }, {
                        $set: {
                            is_online: false,
                        },
                    }, { new: true });
                    return (0, response_functions_1.socketSuccessRes)(i18n_1.default.__("User is offline"), { user_id });
                }
                else {
                    return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("User is online in other device"));
                }
            }
            else {
                return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("User not found"));
            }
        }
        else {
            return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("User session not found"));
        }
    }
    catch (error) {
        console.log("error in disconnect socket", error);
        return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong"));
    }
});
exports.disconnectSocket = disconnectSocket;
const checkUserIsOnline = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { user_id, ln = "en" } = data;
        i18n_1.default.setLocale(ln);
        const findUser = yield model_users_1.users.findOne({
            _id: user_id,
            is_deleted: false,
            is_self_delete: false,
        });
        if (findUser) {
            const userIsOnline = yield model_user_sessions_1.user_sessions.find({
                user_id: findUser._id,
                is_active: true,
            });
            if (userIsOnline.length > 0) {
                return (0, response_functions_1.socketSuccessRes)(i18n_1.default.__("User is online"), { user_id });
            }
            else {
                return (0, response_functions_1.socketSuccessRes)("User is offline", { user_id });
            }
        }
        else {
            return (0, response_functions_1.socketErrorRes)("User not found");
        }
    }
    catch (error) {
        console.log("error", error);
        return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong"));
    }
});
exports.checkUserIsOnline = checkUserIsOnline;

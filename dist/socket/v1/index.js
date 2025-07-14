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
const connect_1 = require("./connect");
const chat_1 = require("./chat");
const i18n_1 = __importDefault(require("i18n"));
const response_functions_1 = require("./../../util/response_functions");
const socketAuth_1 = require("./../../api/middlewares/socketAuth");
exports.default = (io) => {
    const v1version = io.of("/v1");
    v1version.use(socketAuth_1.socketAuth);
    v1version.on("connection", (socket) => {
        console.log("Socket connected  v1.....", socket.id);
        socket.on("setSocketId", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                data = Object.assign(Object.assign({}, data), { socket_id: socket.id, user_id: socket.user._id });
                console.log("setSocketId  on :: ", data);
                socket.join(data.user_id);
                const { ln = "en" } = data;
                i18n_1.default.setLocale(ln);
                const setSocketData = yield (0, connect_1.setSocketId)(data);
                socket.emit("setSocketId", setSocketData);
                const findUserOnline = yield (0, connect_1.checkUserIsOnline)(data);
                if (findUserOnline.success) {
                    v1version.emit("userIsOnline", findUserOnline);
                }
                return;
            }
            catch (error) {
                console.log("setSocketId Error ON:", error instanceof Error ? error.message : String(error));
                yield (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
                return;
            }
        }));
        socket.on("disconnect", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                console.log(" -----------  disconnect  -----------  ", socket.id);
                data = {
                    socket_id: socket.id,
                };
                const disconnect_user = yield (0, connect_1.disconnectSocket)(data, v1version);
                if (disconnect_user.success) {
                    console.log({ disconnect_user });
                    v1version.emit("userIsOffline", disconnect_user);
                }
                return;
            }
            catch (error) {
                console.log("disconnect Error ON:", error instanceof Error ? error.message : String(error));
                yield (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
                return;
            }
        }));
        socket.on("createRoom", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                data = Object.assign(Object.assign({}, data), { user_id: socket.user._id });
                console.log("createRoom  on :: ", data);
                const createRoomData = yield (0, chat_1.createRoom)(data);
                const { ln = "en" } = data;
                i18n_1.default.setLocale(ln);
                // socket.join(createRoomData.data._id.toString());
                socket.emit("createRoom", createRoomData);
                return;
            }
            catch (error) {
                console.log("createRoom Error ON:", error instanceof Error ? error.message : String(error));
                return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
            }
        }));
        socket.on("chatUserList", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                data = Object.assign(Object.assign({}, data), { user_id: socket.user._id });
                console.log("chatUserList  on :: ", data);
                const { ln = "en" } = data;
                i18n_1.default.setLocale(ln);
                socket.join(data.user_id);
                const find_user_list = yield (0, chat_1.chatUserList)(data);
                socket.emit("chatUserList", find_user_list);
                return;
            }
            catch (error) {
                console.log("chatUserList Error ON:", error instanceof Error ? error.message : String(error));
                return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
            }
        }));
        socket.on("sendMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                data = Object.assign(Object.assign({}, data), { sender_id: socket.user._id });
                console.log("sendMessage  on :: ", data);
                const newMessage = yield (0, chat_1.sendMessage)(data);
                if (newMessage.success) {
                    socket.join(data.chat_room_id);
                    v1version
                        .to(data.chat_room_id)
                        .emit("sendMessage", newMessage);
                    const senderChatListData = yield (0, chat_1.updatedChatRoomData)({
                        user_id: data.sender_id,
                        chat_room_id: data.chat_room_id,
                    });
                    v1version
                        .to(data.sender_id)
                        .emit("updatedChatRoomData", senderChatListData);
                    const receiverChatListData = yield (0, chat_1.updatedChatRoomData)({
                        user_id: data.receiver_id,
                        chat_room_id: data.chat_room_id,
                    });
                    v1version
                        .to(data.receiver_id)
                        .emit("updatedChatRoomData", receiverChatListData);
                }
                else {
                    v1version
                        .to(data.chat_room_id)
                        .emit("sendMessage", newMessage);
                }
                return;
            }
            catch (error) {
                console.log("sendMessage Error ON:", error instanceof Error ? error.message : String(error));
                return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
            }
        }));
        socket.on("getAllMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                data = Object.assign(Object.assign({}, data), { user_id: socket.user._id });
                console.log("getAllMessage  on :: ", data);
                socket.join(data.chat_room_id);
                const find_chats = yield (0, chat_1.getAllMessage)(data);
                v1version.emit("getAllMessage", find_chats);
                return;
            }
            catch (error) {
                console.log("getAllMessage Error ON:", error instanceof Error ? error.message : String(error));
                return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
            }
        }));
        socket.on("editMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                data = Object.assign(Object.assign({}, data), { user_id: socket.user._id });
                console.log("editMessage  on :: ", data);
                socket.join(data.chat_room_id);
                const editMessageData = yield (0, chat_1.editMessage)(data);
                if (editMessageData.success) {
                    v1version
                        .to(data.chat_room_id)
                        .emit("editMessage", editMessageData);
                    if (editMessageData.data.isLastMessage) {
                        const senderChatListData = yield (0, chat_1.updatedChatRoomData)({
                            user_id: editMessageData.data.sender_id,
                            chat_room_id: editMessageData.data.chat_room_id,
                        });
                        v1version
                            .to(editMessageData.data.sender_id.toString())
                            .emit("updatedChatRoomData", senderChatListData);
                        const receiverChatListData = yield (0, chat_1.updatedChatRoomData)({
                            user_id: editMessageData.data.receiver_id,
                            chat_room_id: editMessageData.data.chat_room_id,
                        });
                        v1version
                            .to(editMessageData.data.receiver_id.toString())
                            .emit("updatedChatRoomData", receiverChatListData);
                    }
                }
                else {
                    v1version.emit("editMessage", editMessageData);
                }
                return;
            }
            catch (error) {
                console.log("editMessage Error ON:", error instanceof Error ? error.message : String(error));
                return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
            }
        }));
        socket.on("readMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                data = Object.assign(Object.assign({}, data), { user_id: socket.user._id });
                console.log("readMessage  on :: ", data);
                socket.join(data.chat_room_id);
                const readMessages = yield (0, chat_1.readMessage)(data);
                v1version
                    .to(data.chat_room_id)
                    .emit("readMessage", readMessages);
                // socket.to(data.user_id.toString()).emit("msgReadByUser", readMessages);
                const senderChatListData = yield (0, chat_1.updatedChatRoomData)({
                    user_id: data.user_id,
                    chat_room_id: data.chat_room_id,
                });
                v1version
                    .to(data.user_id)
                    .emit("updatedChatRoomData", senderChatListData);
                return;
            }
            catch (error) {
                console.log("readMessage Error ON:", error instanceof Error ? error.message : String(error));
                return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
            }
        }));
        socket.on("deleteMessage", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                data = Object.assign(Object.assign({}, data), { user_id: socket.user._id });
                console.log("deleteMessage  on :: ", data);
                socket.join(data.chat_room_id);
                const deleteMessageData = yield (0, chat_1.deleteMessage)(data);
                if (deleteMessageData.success) {
                    v1version
                        .to(data.chat_room_id)
                        .emit("deleteMessage", deleteMessageData);
                    const userChatListData = yield (0, chat_1.updatedChatRoomData)({
                        user_id: data.user_id,
                        chat_room_id: data.chat_room_id,
                    });
                    v1version
                        .to(data.user_id)
                        .emit("updatedChatRoomData", userChatListData);
                }
                else {
                    socket.emit("deleteMessage", deleteMessageData);
                }
                return;
            }
            catch (error) {
                console.log("deleteMessage Error ON:", error instanceof Error ? error.message : String(error));
                return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
            }
        }));
        socket.on("deleteMessageForEveryOne", (data) => __awaiter(void 0, void 0, void 0, function* () {
            try {
                data = Object.assign(Object.assign({}, data), { user_id: socket.user._id });
                console.log("deleteMessageForEveryOne  on :: ", data);
                socket.join(data.chat_room_id);
                const deleteMessageForEveryOneData = yield (0, chat_1.deleteMessageForEveryOne)(data);
                if (deleteMessageForEveryOneData.success) {
                    v1version
                        .to(data.chat_room_id);
                    const senderChatListData = yield (0, chat_1.updatedChatRoomData)({
                        user_id: data.sender_id,
                        chat_room_id: data.chat_room_id,
                    });
                    v1version
                        .to(data.sender_id)
                        .emit("updatedChatRoomData", senderChatListData);
                    const receiverChatListData = yield (0, chat_1.updatedChatRoomData)({
                        user_id: data.receiver_id,
                        chat_room_id: data.chat_room_id,
                    });
                    v1version
                        .to(data.receiver_id)
                        .emit("updatedChatRoomData", receiverChatListData);
                }
                else {
                    v1version
                        .to(data.chat_room_id)
                        .emit("sendMessage", newMessage);
                }
                return;
            }
            catch (error) {
                console.log("sendMessage Error ON:", error instanceof Error ? error.message : String(error));
                return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
            }
        }));
    });
};
;
socket.on("deleteChatRoom", (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        data = Object.assign(Object.assign({}, data), { user_id: socket.user._id });
        console.log("deleteChatRoom  on :: ", data);
        const deleteChatData = yield (0, chat_1.deleteChatRoom)(data);
        if (deleteChatData.success) {
            v1version
                .to(data.user_id)
                .emit("deleteChatRoom", deleteChatData);
        }
        else {
            socket.emit("deleteChatRoom", deleteChatData);
        }
        return;
    }
    catch (error) {
        console.log("deleteChatRoom Error ON:", error instanceof Error ? error.message : String(error));
        return (0, response_functions_1.socketErrorRes)(i18n_1.default.__("Something went wrong!"));
    }
}));
socket.on("changeScreenStatus", (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        data = Object.assign(Object.assign({}, data), { user_id: socket.user._id, socket_id: socket.id });
        console.log(" -----------  changeScreenStatus  -----------  ", data);
        const change_screen_status = yield (0, chat_1.changeScreenStatus)(data);
        socket.emit("changeScreenStatus", change_screen_status);
    }
    catch (error) {
        console.log("=== changeScreenStatus ===", error instanceof Error ? error.message : String(error));
    }
}));
;
;

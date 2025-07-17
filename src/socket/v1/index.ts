import { setSocketId, disconnectSocket, checkUserIsOnline } from "./connect";
import { Server } from "socket.io";
import { AuthSocket } from "./../../api/middlewares/socketAuth";

import {
  createRoom,
  sendMessage,
  getAllMessage,
  editMessage,
  deleteMessage,
  readMessage,
  deleteChatRoom,
  changeScreenStatus,
  deleteMessageForEveryOne,
  chatUserList,
} from "./chat";

import i18n from "i18n";

import { socketErrorRes } from "./../../util/response_functions";
import { socketAuth } from "./../../api/middlewares/socketAuth";

import { SetSocketIdData, checkUserIsOnlineData } from "./connect";

import {
  CreateRoomData,
  SendMessageData,
  updatedChatRoomData,
  getAllMessageData,
  editMessageData,
  deleteMessageData,
  deleteChatRoomData,
  readMessageData,
  chatUserListData,
  changeScreenStatusData,
} from "./chat";

export default (io: Server) => {
  const v1version = io.of("/v1");
  v1version.use(socketAuth);
  v1version.on("connection", (socket: AuthSocket) => {
    console.log("Socket connected  v1.....", socket.id);

    socket.on(
      "setSocketId",
      async (data: Partial<SetSocketIdData>): Promise<void> => {
        try {
          data = {
            ...data,
            socket_id: socket.id,
            user_id: socket.user._id.toString(),
          };
          console.log("setSocketId  on :: ", data);

          socket.join(data.user_id);

          const { ln = "en" } = data;
          i18n.setLocale(ln);

          const setSocketData = await setSocketId(data as SetSocketIdData);
          socket.emit("setSocketId", setSocketData);

          const findUserOnline = await checkUserIsOnline(
            data as checkUserIsOnlineData,
          );

          if (findUserOnline.success) {
            v1version.emit("userIsOnline", findUserOnline);
          }
          return;
        } catch (error) {
          console.log(
            "setSocketId Error ON:",
            error instanceof Error ? error.message : String(error),
          );
          await socketErrorRes(i18n.__("Something went wrong!"));
          return;
        }
      },
    );

    socket.on("disconnect", async (): Promise<void> => {
      try {
        console.log(" -----------  disconnect  -----------  ", socket.id);

        const disconnectData = {
          socket_id: socket.id,
          user_id: socket.user._id.toString(),
        };

        const disconnect_user = await disconnectSocket(disconnectData, io);

        if (disconnect_user.success) {
          console.log({ disconnect_user });
          v1version.emit("userIsOffline", disconnect_user);
        }
      } catch (error) {
        console.log(
          "disconnect Error ON:",
          error instanceof Error ? error.message : String(error),
        );
        await socketErrorRes(i18n.__("Something went wrong!"));
        return;
      }
    });

    socket.on(
      "createRoom",
      async (data: Partial<CreateRoomData>): Promise<void> => {
        try {
          console.log("createRoom  on :: ", data);

          const createRoomData = await createRoom(data as CreateRoomData);

          const { ln = "en" } = data;
          i18n.setLocale(ln);

          socket.join((createRoomData as { data: { _id: string } }).data._id);

          socket.emit("createRoom", createRoomData);
          return;
        } catch (error) {
          console.log(
            "createRoom Error ON:",
            error instanceof Error ? error.message : String(error),
          );
          await socketErrorRes(i18n.__("Something went wrong!"));
          return;
        }
      },
    );

    socket.on(
      "chatUserList",
      async (data: Partial<chatUserListData>): Promise<void> => {
        try {
          data = {
            ...data,
            user_id: socket.user._id.toString(),
          };

          console.log("chatUserList  on :: ", data);
          const { ln = "en" } = data;
          i18n.setLocale(ln);

          socket.join(data.user_id as string);

          const find_user_list = await chatUserList(data as chatUserListData);
          socket.emit("chatUserList", find_user_list);
          return;
        } catch (error) {
          console.log(
            "chatUserList Error ON:",
            error instanceof Error ? error.message : String(error),
          );
          await socketErrorRes(i18n.__("Something went wrong!"));
          return;
        }
      },
    );

    socket.on(
      "sendMessage",
      async (data: Partial<SendMessageData>): Promise<void> => {
        try {
          data = {
            ...data,
            sender_id: socket.user._id.toString(),
          };
          console.log("sendMessage  on :: ", data);

          const newMessage = await sendMessage(data as SendMessageData);
          if (newMessage.success) {
            socket.join(data.chat_room_id as string);
            v1version
              .to(data.chat_room_id as string)
              .emit("sendMessage", newMessage);

            const senderChatListData = await updatedChatRoomData({
              user_id: data.sender_id as string,
              chat_room_id: data.chat_room_id as string,
            });
            v1version
              .to(data.sender_id as string)
              .emit("updatedChatRoomData", senderChatListData);

            const receiverChatListData = await updatedChatRoomData({
              user_id: data.receiver_id as string,
              chat_room_id: data.chat_room_id as string,
            });
            v1version
              .to(data.receiver_id as string)
              .emit("updatedChatRoomData", receiverChatListData);
          } else {
            v1version
              .to(data.chat_room_id as string)
              .emit("sendMessage", newMessage);
          }
          return;
        } catch (error) {
          console.log(
            "sendMessage Error ON:",
            error instanceof Error ? error.message : String(error),
          );
          await socketErrorRes(i18n.__("Something went wrong!"));
          return;
        }
      },
    );

    socket.on(
      "getAllMessage",
      async (data: Partial<getAllMessageData>): Promise<void> => {
        try {
          data = {
            ...data,
            user_id: socket.user._id.toString(),
          };
          console.log("getAllMessage  on :: ", data);
          socket.join(data.chat_room_id);

          const find_chats = await getAllMessage(data as getAllMessageData);

          socket.emit("getAllMessage", find_chats);
          return;
        } catch (error) {
          console.log(
            "getAllMessage Error ON:",
            error instanceof Error ? error.message : String(error),
          );
          await socketErrorRes(i18n.__("Something went wrong!"));
          return;
        }
      },
    );

    socket.on(
      "editMessage",
      async (data: Partial<editMessageData>): Promise<void> => {
        try {
          data = {
            ...data,
            user_id: socket.user._id.toString(),
          };
          console.log("editMessage  on :: ", data as editMessageData);
          socket.join(data.chat_room_id);

          const editMessageData = await editMessage(data as editMessageData);
          if (editMessageData.success) {
            v1version
              .to(data.chat_room_id as string)
              .emit("editMessage", editMessageData);

            if (
              (editMessageData.data as { isLastMessage: boolean }).isLastMessage
            ) {
              const senderChatListData = await updatedChatRoomData({
                user_id: (editMessageData.data as { sender_id: string })
                  .sender_id,
                chat_room_id: (editMessageData.data as { chat_room_id: string })
                  .chat_room_id,
              });
              v1version
                .to((editMessageData.data as { sender_id: string }).sender_id)
                .emit("updatedChatRoomData", senderChatListData);

              const receiverChatListData = await updatedChatRoomData({
                user_id: (editMessageData.data as { receiver_id: string })
                  .receiver_id,
                chat_room_id: (editMessageData.data as { chat_room_id: string })
                  .chat_room_id,
              });
              v1version
                .to(
                  (editMessageData.data as { receiver_id: string }).receiver_id,
                )
                .emit("updatedChatRoomData", receiverChatListData);
            }
          } else {
            v1version.emit("editMessage", editMessageData);
          }
          return;
        } catch (error) {
          console.log(
            "editMessage Error ON:",
            error instanceof Error ? error.message : String(error),
          );
          await socketErrorRes(i18n.__("Something went wrong!"));
          return;
        }
      },
    );

    socket.on(
      "readMessage",
      async (data: Partial<readMessageData>): Promise<void> => {
        try {
          data = {
            ...data,
            user_id: socket.user._id.toString(),
          };
          console.log("readMessage  on :: ", data);
          socket.join(data.chat_room_id as string);

          const readMessages = await readMessage(data as readMessageData);
          v1version
            .to(data.chat_room_id as string)
            .emit("readMessage", readMessages);

          // socket.to(data.user_id.toString()).emit("msgReadByUser", readMessages);
          const senderChatListData = await updatedChatRoomData({
            user_id: data.user_id as string,
            chat_room_id: data.chat_room_id as string,
          });
          v1version
            .to(data.user_id as string)
            .emit("updatedChatRoomData", senderChatListData);
          return;
        } catch (error) {
          console.log(
            "readMessage Error ON:",
            error instanceof Error ? error.message : String(error),
          );
          await socketErrorRes(i18n.__("Something went wrong!"));
          return;
        }
      },
    );

    socket.on(
      "deleteMessage",
      async (data: Partial<deleteMessageData>): Promise<void> => {
        try {
          data = {
            ...data,
            user_id: socket.user._id.toString(),
          };
          console.log("deleteMessage  on :: ", data);
          socket.join(data.chat_room_id as string);

          const deleteMessageData = await deleteMessage(
            data as deleteMessageData,
          );

          if (deleteMessageData.success) {
            v1version
              .to(data.chat_room_id as string)
              .emit("deleteMessage", deleteMessageData);

            const userChatListData = await updatedChatRoomData({
              user_id: data.user_id as string,
              chat_room_id: data.chat_room_id as string,
            });
            v1version
              .to(data.user_id as string)
              .emit("updatedChatRoomData", userChatListData);
          } else {
            socket.emit("deleteMessage", deleteMessageData);
          }
          return;
        } catch (error) {
          console.log(
            "deleteMessage Error ON:",
            error instanceof Error ? error.message : String(error),
          );
          await socketErrorRes(i18n.__("Something went wrong!"));
          return;
        }
      },
    );

    socket.on(
      "deleteMessageForEveryOne",
      async (data: Partial<deleteMessageData>): Promise<void> => {
        try {
          data = {
            ...data,
            user_id: socket.user._id.toString(),
          };
          console.log("deleteMessageForEveryOne  on :: ", data);
          socket.join(data.chat_room_id as string);

          const deleteMessageForEveryOneData = await deleteMessageForEveryOne(
            data as deleteMessageData,
          );

          if (deleteMessageForEveryOneData.success) {
            v1version.to(data.chat_room_id as string);
            const senderChatListData = await updatedChatRoomData({
              user_id: data.sender_id as string,
              chat_room_id: data.chat_room_id as string,
            });
            v1version
              .to(data.sender_id as string)
              .emit("updatedChatRoomData", senderChatListData);

            const receiverChatListData = await updatedChatRoomData({
              user_id: data.receiver_id as string,
              chat_room_id: data.chat_room_id as string,
            });
            v1version
              .to(data.receiver_id as string)
              .emit("updatedChatRoomData", receiverChatListData);
          } else {
            v1version
              .to(data.chat_room_id as string)
              .emit("deleteMessageForEveryOne", deleteMessageForEveryOneData);
          }
          return;
        } catch (error) {
          console.log(
            "deleteMessageForEveryOne Error ON:",
            error instanceof Error ? error.message : String(error),
          );
          await socketErrorRes(i18n.__("Something went wrong!"));
        }
      },
    );

    socket.on(
      "deleteChatRoom",
      async (data: Partial<deleteChatRoomData>): Promise<void> => {
        try {
          data = {
            ...data,
            user_id: socket.user._id.toString(),
          };
          console.log("deleteChatRoom  on :: ", data);

          const deleteChatData = await deleteChatRoom(
            data as deleteChatRoomData,
          );

          if (deleteChatData.success) {
            v1version
              .to(data.user_id as string)
              .emit("deleteChatRoom", deleteChatData);
          } else {
            socket.emit("deleteChatRoom", deleteChatData);
          }
          return;
        } catch (error) {
          console.log(
            "deleteChatRoom Error ON:",
            error instanceof Error ? error.message : String(error),
          );
          await socketErrorRes(i18n.__("Something went wrong!"));
          return;
        }
      },
    );

    socket.on(
      "changeScreenStatus",
      async (data: Partial<changeScreenStatusData>) => {
        try {
          data = {
            ...data,
            user_id: socket.user._id.toString(),
            socket_id: socket.id,
          };
          console.log(" -----------  changeScreenStatus  -----------  ", data);

          const change_screen_status = await changeScreenStatus(
            data as changeScreenStatusData,
          );

          socket.emit("changeScreenStatus", change_screen_status);
        } catch (error) {
          console.log(
            "=== changeScreenStatus ===",
            error instanceof Error ? error.message : String(error),
          );
        }
      },
    );
  });
};

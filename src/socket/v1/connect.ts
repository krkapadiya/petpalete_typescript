import { users } from "./../../api/model/model.users";
import { user_sessions } from "./../../api/model/model.user_sessions";
import { chat_rooms } from "./../../api/model/model.chat_rooms";
import mongoose from "mongoose";

import i18n from "i18n";

import {
  socketSuccessRes,
  socketErrorRes,
} from "./../../util/response_functions";

import { changeScreenStatus } from "./chat";

export interface SetSocketIdData {
  user_id: string;
  device_token: string;
  socket_id: string;
  ln?: string;
}

export interface DisconnectSocketData {
  socket_id: string;
  ln?: string;
}

export interface checkUserIsOnlineData {
  user_id: string;
  ln?: string;
}

export interface ChangeScreenStatusParamsData {
  chat_room_id: string;
  screen_status: boolean;
  user_id: string;
  socket_id: string;
  ln?: string;
}

export const setSocketId = async (data: SetSocketIdData) => {
  try {
    const { user_id, device_token, socket_id, ln = "en" } = data;

    i18n.setLocale(ln);

    const user = await users.findOne({ _id: user_id });

    const match = await user_sessions.findOne({
      user_id: new mongoose.Types.ObjectId(user_id),
      device_token: device_token,
    });
    console.log("Matched session:", match);

    if (user) {
      await user_sessions.updateOne(
        {
          user_id: new mongoose.Types.ObjectId(user_id),
          device_token: device_token,
        },
        {
          $set: {
            socket_id: socket_id,
            is_active: true,
          },
        },
        {
          new: true,
        },
      );

      return socketSuccessRes(i18n.__("Socket id set successfully!"), data);
    } else {
      return socketErrorRes("User not found!");
    }
  } catch (error) {
    console.log(
      "setSocketId error",
      error instanceof Error ? error.message : String(error),
    );
    return socketErrorRes("Something went wrong");
  }
};

export const disconnectSocket = async (
  data: DisconnectSocketData,
  v1version: string,
) => {
  try {
    const { socket_id, ln = "en" } = data;

    i18n.setLocale(ln);

    const findUserSession = await user_sessions.findOne({
      socket_id: socket_id,
    });

    console.log({ findUserSession });

    if (findUserSession) {
      const findUser = await users.findOne({
        _id: findUserSession.user_id,
        is_deleted: false,
      });
      console.log({ findUser });

      if (findUser) {
        const user_id = findUser._id;
        await user_sessions.updateOne(
          {
            _id: findUserSession._id,
          },
          {
            $set: {
              is_active: false,
              socket_id: null,
              chat_room_id: null,
            },
          },
          { new: true },
        );

        if (findUserSession.chat_room_id !== null) {
          const findChatRoom = await chat_rooms.findOne({
            _id: findUserSession.chat_room_id,
            is_deleted: false,
          });

          if (findChatRoom) {
            const userIsOnlineInChatRoom = await user_sessions.find({
              user_id: findUser._id,
              chat_room_id: findChatRoom._id,
              socket_id: { $ne: socket_id },
              is_active: true,
            });

            if (userIsOnlineInChatRoom.length === 0) {
              const changeStatusData = {
                chat_room_id: findChatRoom._id as unknown as string,
                screen_status: false,
                user_id: findUser._id as unknown as string,
                socket_id: socket_id,
              } as ChangeScreenStatusParamsData;

              const changeScreenStatusData = await changeScreenStatus({
                ...changeStatusData,
                ln: "en",
              });

              if (changeScreenStatusData.success) {
                v1version
                  .to(findChatRoom._id as string)
                  .emit("changeScreenStatus", changeScreenStatusData);
              }
            }
          }
        }

        const userIsOnline = await user_sessions.find({
          user_id: findUser._id,
          is_active: true,
        });

        if (userIsOnline.length === 0) {
          await users.updateOne(
            {
              _id: findUser._id,
            },
            {
              $set: {
                is_online: false,
              },
            },
            { new: true },
          );

          return socketSuccessRes(i18n.__("User is offline"), { user_id });
        } else {
          return socketErrorRes(i18n.__("User is online in other device"));
        }
      } else {
        return socketErrorRes(i18n.__("User not found"));
      }
    } else {
      return socketErrorRes(i18n.__("User session not found"));
    }
  } catch (error) {
    console.log("error in disconnect socket", error);
    return socketErrorRes(i18n.__("Something went wrong"));
  }
};

export const checkUserIsOnline = async (data: checkUserIsOnlineData) => {
  try {
    const { user_id, ln = "en" } = data;

    i18n.setLocale(ln);

    const findUser = await users.findOne({
      _id: user_id,
      is_deleted: false,
      is_self_delete: false,
    });

    if (findUser) {
      const userIsOnline = await user_sessions.find({
        user_id: findUser._id,
        is_active: true,
      });

      if (userIsOnline.length > 0) {
        return socketSuccessRes(i18n.__("User is online"), { user_id });
      } else {
        return socketSuccessRes("User is offline", { user_id });
      }
    } else {
      return socketErrorRes("User not found");
    }
  } catch (error) {
    console.log("error", error);
    return socketErrorRes(i18n.__("Something went wrong"));
  }
};

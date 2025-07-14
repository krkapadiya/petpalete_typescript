import mongoose from "mongoose";
import i18n from "i18n";
import { IUser } from "../../api/model/model.users";

import { dateTime } from "../../util/date_formats";

import { user_sessions } from "../../api/model/model.user_sessions";
import { chats } from "../../api/model/model.chats";
import { chat_rooms } from "../../api/model/model.chat_rooms";
import { notifications } from "../../api/model/model.notifications";

import { multiNotificationSend } from "../../util/send_notifications";

import {
  socketSuccessRes,
  socketErrorRes,
  InternalErrorRes,
} from "../../util/response_functions";

import {
  findUser,
  findChatRoom,
  incNotificationBadge,
  findMessage,
  escapeRegex,
} from "../../util/user_function";

import { removeMediaFromS3Bucket } from "../../util/bucket_manager";

export interface CreateRoomData {
  user_id: string;
  other_user_id: string;
  ln?: string;
}

export interface SendMessageData {
  sender_id: string;
  chat_room_id: string;
  receiver_id: string;
  message: string;
  message_type: string;
  media_file: MediaFileData[];
  ln?: string;
}

export interface MediaFileData {
  file_type: "video" | "image";
  file_name: string;
  file_path: string;
  thumbnail?: string | null;
  thumbnail_name?: string | null;
}

export interface ChatInsertData {
  chat_room_id: string;
  sender_id: string;
  receiver_id: string;
  message_time: string;
  message: string;
  message_type: string;
  media_file?: MediaFileData[];
  is_read?: boolean;
}

export interface NotiData {
  device_token: string[];
  noti_title: string;
  noti_msg: string;
  noti_for: string;
  id: string;
  noti_image?: string;
  chat_room_id?: string;
  sender_id?: string;
  sound_name: string;
}

export interface getAllMessageData {
  chat_room_id: string;
  user_id: string;
  ln?: string;
  page?: number;
  limit?: number;
}

export interface editMessageData {
  chat_id: string;
  chat_room_id: string;
  user_id: string;
  message: string;
  ln?: string;
}

export interface deleteMessageData {
  chat_room_id: string;
  chat_id: string;
  user_id: string;
  ln?: string;
}

export interface readMessageData {
  chat_room_id: string;
  user_id: string;
  ln?: string;
}

export interface chatUserListData {
  user_id: string;
  search?: string;
  page?: number;
  limit?: number;
  ln?: string;
}

export interface updatedChatRoom {
  chat_room_id: string;
  user_id: string;
  ln?: string;
}

export interface deleteChatRoomData {
  chat_room_id: string;
  user_id: string;
  ln?: string;
}
export interface chatUserListData {
  user_id: string;
  search?: string;
  page?: number;
  limit?: number;
  ln?: string;
}
export interface changeScreenStatusData {
  user_id: string;
  screen_status: string | boolean;
  chat_room_id: string;
  socket_id: string;
  ln?: string;
}

export const createRoom = async (data: CreateRoomData) => {
  try {
    const { user_id, other_user_id, ln = "en" } = data;

    i18n.setLocale(ln);

    const userObjectId = new mongoose.Types.ObjectId(user_id);
    const otherUserObjectId = new mongoose.Types.ObjectId(other_user_id);

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

    const findRoom = await chat_rooms.findOne({
      $or: [cond1, cond2],
    });

    let chat_room_id;

    if (findRoom) {
      chat_room_id = findRoom._id;

      const findChatDeleteByUser = await chat_rooms.findOne({
        _id: findRoom._id,
        is_delete_by: { $eq: user_id },
      });

      if (findChatDeleteByUser) {
        await chat_rooms.findByIdAndUpdate(
          findRoom._id,
          {
            $pull: { is_delete_by: user_id },
          },
          { new: true },
        );
      }
    } else {
      const createData = {
        user_id: userObjectId,
        other_user_id: otherUserObjectId,
      };

      const createNewRoom = await chat_rooms.create(createData);

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

    const [ChatRoomData] = await chat_rooms.aggregate([
      {
        $match: {
          _id:
            typeof chat_room_id === "string"
              ? new mongoose.Types.ObjectId(chat_room_id)
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
            userId: new mongoose.Types.ObjectId(user_id),
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

    return socketSuccessRes(
      i18n.__("Chat room created successfully"),
      ChatRoomData,
    );
  } catch (error) {
    console.log(
      "createRoom Error EMIT:",
      error instanceof Error ? error.message : String(error),
    );
    return socketErrorRes(i18n.__("Something went wrong!"));
  }
};

export const sendMessage = async (data: SendMessageData) => {
  try {
    const {
      sender_id,
      chat_room_id,
      receiver_id,
      message,
      message_type,
      media_file,
      ln = "en",
    } = data;
    i18n.setLocale(ln);
    const currentDateTime = await dateTime();

    const senderObjectId = new mongoose.Types.ObjectId(sender_id);

    const findChatRoomExists = await findChatRoom(chat_room_id);

    if (!findChatRoomExists) {
      return socketErrorRes(i18n.__("Chat room not found"));
    }

    let insertData: ChatInsertData = {
      chat_room_id: chat_room_id,
      sender_id: sender_id,
      receiver_id: receiver_id,
      message_time: currentDateTime,
      message: message,
      message_type: message_type,
    };

    const media_file_array: MediaFileData[] = [];

    if (message_type == "media") {
      for (const value of media_file) {
        const files: MediaFileData = {
          file_type: value.file_type,
          file_path: value.file_path,
          file_name: value.file_name,
          thumbnail: value.thumbnail || null,
        };

        media_file_array.push(files);
      }
    }

    if (media_file_array.length > 0) {
      insertData = {
        ...insertData,
        media_file: media_file_array,
      };
    }

    const receiverIsOnline = await user_sessions.findOne({
      user_id: receiver_id,
      is_active: true,
      chat_room_id: chat_room_id,
    });

    if (receiverIsOnline) {
      insertData = {
        ...insertData,
        is_read: true,
      };
    }

    const createdChat = await chats.create(insertData);

    const findSender = await findUser(senderObjectId.toString());

    if (!findSender) {
      console.error("Sender not found:", senderObjectId.toString());
      return InternalErrorRes();
    }

    if (!receiverIsOnline) {
      const noti_title = (findSender as IUser).full_name || "";

      let noti_msg;

      if (message_type == "media") {
        noti_msg = `sent a media 🎥📸`;
      } else {
        noti_msg = message;
      }

      const noti_for = "chat_notification";

      let notiData: NotiData = {
        device_token: [],
        noti_title: (findSender as IUser).full_name || "",
        noti_msg,
        noti_for,
        id: chat_room_id,
        chat_room_id,
        sender_id,
        sound_name: "default",
      };

      const findDeviceTokens = await user_sessions.find({
        user_id: receiver_id,
      });

      const deviceTokenArray = findDeviceTokens.map((row) => row.device_token);

      if (deviceTokenArray.length > 0) {
        notiData = { ...notiData, device_token: deviceTokenArray };
        multiNotificationSend(notiData);
        incNotificationBadge(receiver_id);
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

      await notifications.create(inAppNotificationData);
    }

    const [findMessage] = await chats.aggregate([
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

    const findChatDeleteByUser = await chat_rooms.findOne({
      _id: chat_room_id,
      $or: [
        { is_delete_by: { $eq: receiver_id } },
        { is_delete_by: { $eq: sender_id } },
      ],
    });

    if (findChatDeleteByUser) {
      await chat_rooms.findByIdAndUpdate(
        chat_room_id,
        {
          $set: { is_delete_by: [] },
        },
        { new: true },
      );
    }

    return socketSuccessRes(i18n.__("Message sent successfully"), findMessage);
  } catch (error) {
    console.log("sendMessage Error EMIT:", error);
    return socketErrorRes(i18n.__("Something went wrong!"));
  }
};

export const getAllMessage = async (data: getAllMessageData) => {
  try {
    const { chat_room_id, user_id, page = 1, limit = 10, ln = "en" } = data;

    i18n.setLocale(ln);

    const chatRoomObjectId = new mongoose.Types.ObjectId(chat_room_id);
    const userObjectId = new mongoose.Types.ObjectId(user_id);

    const findChatRoomExists = await findChatRoom(chatRoomObjectId.toString());

    if (!findChatRoomExists) {
      return socketErrorRes(i18n.__("Chat room not found"));
    }

    const findAllMessages = await chats.aggregate([
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

    return socketSuccessRes(
      i18n.__("Messages get successfully"),
      findAllMessages,
    );
  } catch (error) {
    console.log(
      "getAllMessage Error EMIT:",
      error instanceof Error ? error.message : String(error),
    );
    return socketErrorRes(i18n.__("Something went wrong!"));
  }
};

export const editMessage = async (data: editMessageData) => {
  try {
    const { chat_id, chat_room_id, user_id, message, ln = "en" } = data;
    i18n.setLocale(ln);

    const chatObjectId = new mongoose.Types.ObjectId(chat_id);
    const chatRoomObjectId = new mongoose.Types.ObjectId(chat_room_id);
    const userObjectId = new mongoose.Types.ObjectId(user_id);

    const find_message = await findMessage(chatObjectId.toString());

    if (!find_message) {
      return socketErrorRes(i18n.__("Message not find"));
    }

    if (find_message.sender_id.toString() !== userObjectId.toString()) {
      return socketErrorRes(
        i18n.__("You do not have permission to edit this message"),
      );
    }

    await chats.updateOne(
      {
        _id: chatObjectId,
        chat_room_id: chatRoomObjectId,
        sender_id: userObjectId,
      },
      {
        $set: {
          message: message,
          is_edited: true,
        },
      },
    );

    const editedMessage = await findMessage(chatObjectId.toString());

    const lastMessage = await chats
      .findOne({
        chat_room_id: chat_room_id,
      })
      .sort({
        createdAt: -1,
      });

    let isLastMessage = false;
    if (lastMessage && lastMessage._id instanceof mongoose.Types.ObjectId) {
      isLastMessage = true;
    }

    return socketSuccessRes(i18n.__("Message edited successfully"), {
      ...editedMessage,
      isLastMessage,
    });
  } catch (error) {
    console.log(
      "editMessage Error EMIT:",
      error instanceof Error ? error.message : String(error),
    );
    return socketErrorRes(i18n.__("Something went wrong!"));
  }
};

export const deleteMessage = async (data: deleteMessageData) => {
  try {
    const { chat_room_id, chat_id, user_id, ln = "en" } = data;
    i18n.setLocale(ln);

    const chatObjectId = new mongoose.Types.ObjectId(chat_id);

    const find_message = await findMessage(chatObjectId.toString());

    if (!find_message) {
      return socketErrorRes(i18n.__("Message not find"));
    }

    const delete_data = { is_delete_by: user_id };

    await chats
      .updateOne({ _id: find_message._id }, { $push: delete_data })
      .where({ is_delete_by: { $ne: user_id } });

    const updatedMessage = await findMessage(chatObjectId.toString());

    if (updatedMessage && updatedMessage.message_type == "media") {
      if (updatedMessage.is_delete_by.length == 2) {
        updatedMessage.media_file.map(async (media: MediaFileData) => {
          try {
            if (media.thumbnail_name) {
              await removeMediaFromS3Bucket(media.thumbnail_name);
            }
            const file_name = `socket_media/${media.file_name}`;
            await removeMediaFromS3Bucket(file_name);
          } catch (error) {
            console.log("failed to delete media from s3", error);
          }
        });
      }
    }
    return socketSuccessRes("Chat deleted successfully", {
      chat_room_id: chat_room_id,
      chat_id: chat_id,
      user_id: user_id,
    });
  } catch (error) {
    console.log(
      "deleteMessage Error EMIT:",
      error instanceof Error ? error.message : String(error),
    );
    return socketErrorRes(i18n.__("Something went wrong!"));
  }
};

export const deleteMessageForEveryOne = async (data: deleteMessageData) => {
  try {
    const { chat_room_id, chat_id, user_id, ln = "en" } = data;
    i18n.setLocale(ln);

    const chatObjectId = new mongoose.Types.ObjectId(chat_id);

    const findMessageData = await findMessage(chatObjectId.toString());

    if (!findMessageData) {
      return socketErrorRes(i18n.__("Message not find"));
    }

    if (findMessageData.sender_id.toString() !== user_id.toString()) {
      return socketErrorRes(
        i18n.__("You do not have permission to delete this message"),
      );
    }

    await chats.updateOne(
      { _id: findMessageData._id },
      { $set: { is_delete_everyone: true } },
    );

    const updatedMessage = await findMessage(chatObjectId.toString());

    if (updatedMessage && updatedMessage.message_type == "media") {
      console.log(updatedMessage && updatedMessage.message_type == "media");
      if (updatedMessage.is_delete_everyone == true) {
        updatedMessage.media_file.map(async (media: MediaFileData) => {
          try {
            if (media.thumbnail_name) {
              await removeMediaFromS3Bucket(media.thumbnail_name);
            }
            const file_name = `socket_media/${media.file_name}`;
            await removeMediaFromS3Bucket(file_name);
          } catch (error) {
            console.log("failed to delete media from s3", error);
          }
        });
      }
    }

    await notifications.deleteMany({
      chat_room_id: chat_room_id,
      chat_id: chat_id,
    });

    const lastMessage = await chats
      .findOne({
        chat_room_id: chat_room_id,
      })
      .sort({
        createdAt: -1,
      });

    let isLastMessage = false;

    if (
      lastMessage &&
      updatedMessage &&
      lastMessage._id &&
      updatedMessage._id
    ) {
      isLastMessage =
        lastMessage._id.toString() === updatedMessage._id.toString();
    }

    return socketSuccessRes("Chat deleted successfully", {
      ...updatedMessage,
      isLastMessage,
    });
  } catch (error) {
    console.log(
      "deleteMessage Error EMIT:",
      error instanceof Error ? error.message : String(error),
    );
    return socketErrorRes(i18n.__("Something went wrong!"));
  }
};

export const readMessage = async (data: readMessageData) => {
  try {
    const { chat_room_id, user_id, ln = "en" } = data;
    i18n.setLocale(ln);

    const chatRoomObjectId = new mongoose.Types.ObjectId(chat_room_id);
    const userObjectId = new mongoose.Types.ObjectId(user_id);

    await chats.updateMany(
      {
        chat_room_id: chatRoomObjectId,
        receiver_id: userObjectId,
        is_read: false,
      },
      {
        $set: {
          is_read: true,
        },
      },
    );

    return socketSuccessRes(i18n.__("Messages read successfully"), {
      chat_room_id,
    });
  } catch (error) {
    console.log(
      "readMessage Error EMIT:",
      error instanceof Error ? error.message : String(error),
    );
    return socketErrorRes(i18n.__("Something went wrong!"));
  }
};

export const chatUserList = async (data: chatUserListData) => {
  try {
    const { user_id, search = "", page = 1, limit = 10, ln = "en" } = data;
    i18n.setLocale(ln);

    const escapedSearch = search ? await escapeRegex(search) : null;

    const userObjectId = new mongoose.Types.ObjectId(user_id);

    const matchCondition = {
      $or: [{ user_id: userObjectId }, { other_user_id: userObjectId }],
      is_delete_by: { $ne: new mongoose.Types.ObjectId(user_id) },
      is_deleted: false,
    };

    const findAllRooms = await chat_rooms.aggregate([
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
            userId: new mongoose.Types.ObjectId(user_id),
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

    return socketSuccessRes(
      i18n.__("User list get successfully"),
      findAllRooms,
    );
  } catch (error) {
    console.log(
      "chatUserList Error EMIT:",
      error instanceof Error ? error.message : String(error),
    );
    return socketErrorRes(i18n.__("Something went wrong!"));
  }
};

export const updatedChatRoomData = async (data: updatedChatRoom) => {
  try {
    const { user_id, chat_room_id, ln = "en" } = data;
    i18n.setLocale(ln);

    const userObjectId = new mongoose.Types.ObjectId(user_id);
    const chatObjectId = new mongoose.Types.ObjectId(chat_room_id);

    const matchCondition = {
      _id: chatObjectId,
      is_deleted: false,
    };

    const [findRoom] = await chat_rooms.aggregate([
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
            userId: new mongoose.Types.ObjectId(user_id),
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

    return socketSuccessRes(
      i18n.__("chat room data get successfully"),
      findRoom,
    );
  } catch (error) {
    console.log(
      "updatedChatRoomData Error EMIT:",
      error instanceof Error ? error.message : String(error),
    );
    return socketErrorRes(i18n.__("Something went wrong!"));
  }
};

export const deleteChatRoom = async (data: deleteChatRoomData) => {
  try {
    const { chat_room_id, user_id, ln = "en" } = data;
    i18n.setLocale(ln);

    const chatRoomObjectId = new mongoose.Types.ObjectId(chat_room_id);

    const findChatRoomExists = await findChatRoom(chatRoomObjectId.toString());

    if (!findChatRoomExists) {
      return socketErrorRes(i18n.__("Message not find"));
    }

    const delete_data = { is_delete_by: user_id };

    await chats
      .updateMany({ chat_room_id: chat_room_id }, { $push: delete_data })
      .where({ is_delete_by: { $ne: user_id } });

    await chat_rooms
      .updateOne({ _id: chat_room_id }, { $push: delete_data })
      .where({ is_delete_by: { $ne: user_id } });

    return socketSuccessRes(i18n.__("Chat deleted successfully"), {
      chat_room_id,
    });
  } catch (error) {
    console.log(
      "deleteMessage Error EMIT:",
      error instanceof Error ? error.message : String(error),
    );
    return socketErrorRes(i18n.__("Something went wrong!"));
  }
};

export const changeScreenStatus = async (data: changeScreenStatusData) => {
  try {
    const { user_id, screen_status, chat_room_id, socket_id } = data;

    const find_chat_room = await chat_rooms.findOne({
      _id: chat_room_id,
      is_deleted: false,
    });

    if (!find_chat_room) {
      return socketErrorRes("Chat room not found");
    }

    if (screen_status == "true" || screen_status == true) {
      await user_sessions.updateOne(
        {
          user_id: user_id,
          socket_id: socket_id,
        },
        {
          $set: {
            chat_room_id: chat_room_id,
          },
        },
        { new: true },
      );
    } else {
      await user_sessions.updateOne(
        {
          user_id: user_id,
          socket_id: socket_id,
        },
        {
          $set: {
            chat_room_id: null,
          },
        },
        { new: true },
      );
    }

    return socketSuccessRes("Screen status changed successfully", []);
  } catch (error) {
    console.log(
      "changeScreenStatus Error EMIT:",
      error instanceof Error ? error.message : String(error),
    );
    return socketErrorRes(i18n.__("Something went wrong!"));
  }
};

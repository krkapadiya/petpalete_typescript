// utils/data_helpers.ts
import mongoose from "mongoose";

import { users } from "./../api/model/model.users";
import { payments } from "../api/model/model.payments";
import { guests } from "./../api/model/model.guests";
import { user_albums } from "./../api/model/model.user_albums";
import { email_verifications } from "./../api/model/model.email_varifications";
import { app_contents } from "./../api/model/model.app_contents";
import { faqs } from "./../api/model/model.faqs";
import { pets } from "./../api/model/model.pets";
import { report_users } from "./../api/model/model.report_users";
import { communities } from "./../api/model/model.communities";
import { communities_albums } from "./../api/model/model.communities_albums";
import { services } from "./../api/model/model.services";
import { service_albums } from "./../api/model/model.service_albums";
import { service_likes } from "./../api/model/model.service_likes";
import { pet_albums } from "./../api/model/model.pet_albums";
import { pet_likes } from "./../api/model/model.pet_likes";
import { user_sessions } from "./../api/model/model.user_sessions";
import { user_reviews } from "./../api/model/model.user_reviews";
import { chat_rooms } from "./../api/model/model.chat_rooms";
import { chats } from "./../api/model/model.chats";

import { InternalErrorRes } from "./../util/response_functions";
import { IUser } from "../api/model/model.users";

export const findGuestUser = async (device_token: string) => {
  try {
    const user_data = await guests.findOne({ device_token });
    return user_data;
  } catch (error) {
    console.error("Error:", error);
    return InternalErrorRes();
  }
};

export const findUser = async (user_id: string) => {
  try {
    const user_data = await users.findOne({ _id: user_id, is_deleted: false });
    return user_data;
  } catch (error) {
    console.error("Error:", error);
    return InternalErrorRes();
  }
};

export const findBlockUser = async (user_id: string) => {
  try {
    const user_data = await users.findOne({
      _id: user_id,
      is_blocked_by_admin: true,
    });
    return user_data;
  } catch (error) {
    console.error("Error:", error);
    return InternalErrorRes();
  }
};

export const findUserAlbum = async (user_id: string) => {
  try {
    const user_album_data = await user_albums.find({
      user_id,
      album_type: "image",
    });
    return user_album_data[0]?.album_path;
  } catch (error) {
    console.error("Error:", error);
    return InternalErrorRes();
  }
};

export const findUserAlbumId = async (user_id: string) => {
  try {
    const user_album_data = await user_albums.find({
      user_id,
      album_type: "image",
    });
    return user_album_data[0]?._id;
  } catch (error) {
    console.error("Error:", error);
    return InternalErrorRes();
  }
};

export const findAlbumById = async (album_id: string, user_id: string) => {
  try {
    const album_data = await user_albums.findOne({ _id: album_id, user_id });
    return album_data;
  } catch (error) {
    console.error("Error:", error);
    return InternalErrorRes();
  }
};

export const findDeviceToken = async (user_id: string) => {
  try {
    return await user_sessions
      .find({ user_id, user_type: "user" })
      .distinct("device_token");
  } catch (error) {
    console.error("Error:", error);
    return InternalErrorRes();
  }
};

export const findMultipleUserDeviceToken = async (user_ids: string[]) => {
  try {
    return await user_sessions
      .find({ user_id: { $in: user_ids }, user_type: "user" })
      .distinct("device_token");
  } catch (error) {
    console.error("Error fetching device tokens:", error);
    return [];
  }
};

export const findEmailAddress = async (
  email_address: string,
): Promise<IUser | null> => {
  try {
    return await users.findOne({ email_address, is_deleted: false });
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

export const findSocialEmailAddress = async (email_address: string) => {
  try {
    return await users.findOne({
      email_address,
      is_social_login: true,
      is_deleted: false,
    });
  } catch (error) {
    console.error("Error:", error);
    return InternalErrorRes();
  }
};

export const findCommunity = async (community_id: string) => {
  try {
    const community_data = await communities.findOne({
      _id: community_id,
      is_deleted: false,
    });

    return community_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findSocialBlockUser = async (email_address: string) => {
  try {
    return await users.findOne({
      email_address,
      is_social_login: true,
      is_blocked_by_admin: true,
      is_deleted: false,
    });
  } catch (error) {
    console.error("Error:", error);
    return InternalErrorRes();
  }
};

export const findMobileNumber = async (mobile_number: string) => {
  try {
    return await users.findOne({ mobile_number, is_deleted: false });
  } catch (error) {
    console.error("Error:", error);
    return InternalErrorRes();
  }
};

export const findVerifyEmailAddress = async (email_address: string) => {
  try {
    return await email_verifications.findOne({
      email_address,
      is_email_verified: true,
      is_deleted: false,
    });
  } catch (error) {
    console.error("Error:", error);
    return InternalErrorRes();
  }
};

export const findPet = async (pet_id: string) => {
  try {
    const pet_data = await pets.findOne({
      _id: pet_id,
      is_deleted: false,
    });

    return pet_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findService = async (service_id: string) => {
  try {
    const service_data = await services.findOne({
      _id: service_id,
      is_deleted: false,
    });

    return service_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findUsersCommunity = async (
  user_id: string,
  community_id: string,
) => {
  try {
    const community_data = await communities.findOne({
      _id: community_id,
      user_id: user_id,
      is_deleted: false,
    });

    return community_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};
export const incMultipleUserNotificationBadge = async (user_ids: string[]) => {
  try {
    const update_data = await users.updateMany(
      {
        _id: { $in: user_ids },
        is_deleted: false,
      },
      {
        $inc: {
          notification_badge: 1,
        },
      },
    );

    return update_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findCommunityAlbums = async (
  user_id: string,
  community_id: string,
) => {
  try {
    const community_data = await communities_albums.find({
      user_id: user_id,
      community_id: community_id,
    });

    return community_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findCommunityAlbumById = async (
  album_id: string,
  user_id: string,
): Promise<any | null> => {
  try {
    const album_data_by_id = await communities_albums.findOne({
      _id: album_id,
      user_id: user_id,
    });

    return album_data_by_id;
  } catch (error) {
    console.error("Error finding community album:", error);
    return null;
  }
};

export const findExistingPayment = async (user_id: string, pet_id: string) => {
  try {
    const payment_data = await payments.findOne({
      user_id: user_id,
      pet_id: pet_id,
    });

    return payment_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const incNotificationBadge = async (user_id: string) => {
  try {
    const update_data = await users.updateOne(
      {
        _id: user_id,
        is_deleted: false,
      },
      {
        $inc: {
          notification_badge: 1,
        },
      },
    );

    return update_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findExistingReport = async (
  user_id: string,
  reported_user_id: string,
) => {
  try {
    const report_data = await report_users.findOne({
      user_id: user_id,
      reported_user_id: reported_user_id,
    });

    return report_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findReview = async (review_id: string) => {
  try {
    const review_data = await user_reviews.findOne({
      _id: review_id,
    });

    return review_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findOwnReview = async (user_id: string, review_id: string) => {
  try {
    const review_data = await user_reviews.findOne({
      _id: review_id,
      user_id: user_id,
    });

    return review_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findExistingReview = async (
  user_id: string,
  reviewed_user_id: string,
) => {
  try {
    const review_data = await user_reviews.findOne({
      user_id: user_id,
      reviewed_user_id: reviewed_user_id,
    });

    return review_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findPetLike = async (user_id: string, pet_id: string) => {
  try {
    const pet_data = await pet_likes.findOne({
      user_id: user_id,
      pet_id: pet_id,
    });

    return pet_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findUsersPet = async (user_id: string, pet_id: string) => {
  try {
    const pet_data = await pets.findOne({
      _id: pet_id,
      user_id: user_id,
      is_deleted: false,
    });

    return pet_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findPetAlbums = async (user_id: string, pet_id: string) => {
  try {
    const pet_data = await pet_albums.find({
      user_id: user_id,
      pet_id: pet_id,
    });

    return pet_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findPetAlbumById = async (album_id: string, user_id: string) => {
  try {
    const album_data_by_id = await pet_albums.findOne({
      _id: album_id,
      user_id: user_id,
    });

    return album_data_by_id;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findServiceLike = async (user_id: string, service_id: string) => {
  try {
    const service_data = await service_likes.findOne({
      user_id: user_id,
      service_id: service_id,
    });

    return service_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findUsersService = async (user_id: string, service_id: string) => {
  try {
    const service_data = await services.findOne({
      _id: service_id,
      user_id: user_id,
      is_deleted: false,
    });

    return service_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findServiceAlbums = async (
  user_id: string,
  service_id: string,
) => {
  try {
    const service_data = await service_albums.find({
      user_id: user_id,
      service_id: service_id,
    });

    return service_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findServiceAlbumById = async (
  album_id: string,
  user_id: string,
) => {
  try {
    const album_data_by_id = await service_albums.findOne({
      _id: album_id,
      user_id: user_id,
    });

    return album_data_by_id;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findChatRoom = async (chat_room_id: string) => {
  try {
    const chat_room_data = await chat_rooms.findOne({
      _id: chat_room_id,
    });

    return chat_room_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findMessage = async (chat_id: string) => {
  try {
    const [findChat] = await chats.aggregate([
      {
        $match: {
          _id: new mongoose.Types.ObjectId(chat_id),
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
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const escapeRegex = (text: string): string => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#]/g, "\\$&");
};

export const objectId = (id: string): mongoose.Types.ObjectId => {
  return new mongoose.Types.ObjectId(id);
};

export const findContentByType = async (content_type: string) => {
  try {
    const content_data = await app_contents.findOne({
      content_type: content_type,
      is_deleted: false,
    });

    return content_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findContent = async (content_id: string) => {
  try {
    const content_data = await app_contents.findOne({
      _id: content_id,
      is_deleted: false,
    });

    return content_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findFaqByName = async (question: string) => {
  try {
    const faq_data = await faqs.findOne({
      question: question,
    });

    return faq_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

export const findFaq = async (faq_id: string) => {
  try {
    const faq_data = await faqs.findOne({
      _id: faq_id,
    });

    return faq_data;
  } catch (error) {
    console.log("Error : ", error);
    return InternalErrorRes();
  }
};

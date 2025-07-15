import i18n from "i18n";
import { Request, Response } from "express";
import { communities } from "../../../model/model.communities";
import { users } from "../../../model/model.users";
import { guests } from "../../../model/model.guests";
import { notifications } from "../../../model/model.notifications";
import { communities_albums } from "../../../model/model.communities_albums";
import { ICommunityAlbum } from "../../../model/model.communities_albums";
import { MediaFile } from "../../../../util/bucket_manager";
import fs from "fs";

import {
  errorRes,
  successRes,
  multiSuccessRes,
} from "../../../../util/response_functions";

import {
  findCommunity,
  incMultipleUserNotificationBadge,
  findMultipleUserDeviceToken,
  escapeRegex,
  objectId,
  findUsersCommunity,
  findCommunityAlbums,
  findCommunityAlbumById,
} from "../../../../util/user_function";

import { multiNotificationSend } from "../../../../util/send_notifications";

import {
  uploadMediaIntoS3Bucket,
  removeMediaFromS3Bucket,
} from "../../../../util/bucket_manager";

export interface IUserRequest extends Request {
  user: {
    _id: string;
    [key: string]: unknown;
  };
}

interface CommunityInsertData {
  user_id: string;
  title: string;
  address: string;
  description: string;
  location?: unknown;
}

export const addCommunity = async (
  req: IUserRequest,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { title, location, address, description, ln } = req.body;

    i18n.setLocale(req, ln);

    const insert_data: CommunityInsertData = {
      user_id,
      title,
      address,
      description,
    };

    if (location) {
      const location_json_parse = JSON.parse(location);
      insert_data.location = location_json_parse;
    }

    const newCommunity = await communities.create(insert_data);

    if (newCommunity) {
      const userObjectId = await objectId(user_id);

      const location_parse = JSON.parse(location);
      const find_nearby_users = (await users.find({
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
            $maxDistance: 160934, // 50 miles
          },
        },
      })) as { _id: { toString: () => string } }[];

      const nearUserIds: string[] = find_nearby_users.map((user) =>
        user._id.toString(),
      );

      const find_nearby_guest_users = await guests.find({
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [
                location_parse.coordinates[0],
                location_parse.coordinates[1],
              ],
            },
            $maxDistance: 160934, // 50 miles
          },
        },
      });

      const nearUserDeviceTokens: string[] = find_nearby_guest_users.map(
        (user: { device_token: string }) => user.device_token,
      );

      const deviceTokenData:
        | string[]
        | {
            success: boolean;
            statuscode: number;
            message: string;
            data: string[];
          } = await findMultipleUserDeviceToken(nearUserIds);

      const noti_msg =
        "Don’t miss out! Someone shared something in the community.";
      const noti_title = "Someone posted in the community";
      const noti_for = "new_community";

      const notiData = {
        noti_msg,
        noti_title,
        noti_for,
        device_token: Array.isArray(deviceTokenData) ? deviceTokenData : [],
        community_id: newCommunity._id,
        id: newCommunity._id.toString(),
        sound_name: "default",
      };

      await notifications.create({
        sender_id: userObjectId,
        receiver_ids: nearUserIds,
        noti_title,
        noti_msg,
        noti_for,
        community_id: newCommunity._id,
      });

      if (Array.isArray(deviceTokenData) && deviceTokenData.length > 0) {
        await multiNotificationSend(notiData);
        await incMultipleUserNotificationBadge(nearUserIds);
      }

      const notiDataGuest = {
        noti_msg,
        noti_title,
        noti_for,
        device_token: nearUserDeviceTokens,
        community_id: newCommunity._id,
        id: newCommunity._id.toString(),
        sound_name: "default",
      };

      if (nearUserDeviceTokens.length > 0) {
        await multiNotificationSend(notiDataGuest);
      }
    }

    await successRes(
      res,
      res.__("The Community has been successfully added."),
      newCommunity,
    );
  } catch (error) {
    console.error("Error:", error);
    await errorRes(res, res.__("Internal server error"));
  }
};

export const addMultipleServices = async (
  req: IUserRequest,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;

    const { title, location, address, description, ln } = req.body;

    i18n.setLocale(req, ln);

    for (let i = 1; i <= 500; i++) {
      const insert_data: CommunityInsertData = {
        user_id,
        title,
        address,
        description,
      };

      if (location) {
        const location_json_parse = JSON.parse(location);
        insert_data.location = location_json_parse;
      }

      const newService = await communities.create(insert_data);

      interface CommunityAlbumData {
        user_id: string;
        community_id: string;
        album_type: "image" | "video";
        album_thumbnail?: string | null;
        album_path: string;
      }

      const fileData: CommunityAlbumData = {
        user_id: user_id,
        community_id: newService._id.toString(),
        album_type: "image",
        album_thumbnail: null,
        album_path: "community_media/8324_1749737660281.jpg",
      };

      await communities_albums.create(fileData);

      console.log("No of community: ", i);
    }
  } catch (error) {
    console.log("Error in addMultipleServices:", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const editCommunity = async (
  req: IUserRequest,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;

    const { community_id, title, location, address, description, ln } =
      req.body;

    i18n.setLocale(req, ln);

    const find_community = await findCommunity(community_id);

    if (!find_community) {
      await errorRes(res, res.__("Community not found."));
      return;
    }

    const find_users_community = await findUsersCommunity(
      user_id,
      community_id,
    );

    if (!find_users_community) {
      await errorRes(
        res,
        res.__("You don't have permission to edit this community."),
      );
      return;
    }

    const updated_data: CommunityInsertData = {
      user_id,
      title,
      address,
      description,
    };

    if (location) {
      const location_json_parse = JSON.parse(location);
      updated_data.location = location_json_parse;
    }

    await communities.updateOne(
      {
        _id: community_id,
      },
      {
        $set: updated_data,
      },
    );

    const updated_community = await findCommunity(community_id);

    await successRes(
      res,
      res.__("The community has been successfully updated."),
      updated_community,
    );
    return;
  } catch (error) {
    console.log("Error:", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const deleteCommunity = async (
  req: IUserRequest,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;

    const { community_id, ln } = req.body;

    i18n.setLocale(req, ln);

    const find_community = await findCommunity(community_id);

    if (!find_community) {
      await errorRes(res, res.__("Community not found."));
      return;
    }

    const find_users_community = await findUsersCommunity(
      user_id,
      community_id,
    );

    if (!find_users_community) {
      await errorRes(
        res,
        res.__("You don't have permission to delete this community."),
      );
      return;
    }

    const response = await findCommunityAlbums(user_id, community_id);

    // Type guard: check if response is an array
    interface Album {
      album_type: string;
      album_path?: string;
      album_thumbnail?: string;
    }
    const toAlbums = (val: unknown): Album[] =>
      Array.isArray(val) ? (val as Album[]) : [];

    const albums: Album[] = Array.isArray(response)
      ? toAlbums(response)
      : Array.isArray((response as { data?: unknown }).data)
        ? toAlbums((response as { data: unknown }).data)
        : [];

    for (const element of albums) {
      if (element.album_type === "video") {
        if (element.album_path) {
          await removeMediaFromS3Bucket(element.album_path);
        }
        if (element.album_thumbnail) {
          await removeMediaFromS3Bucket(element.album_thumbnail);
        }
      } else if (element.album_path) {
        await removeMediaFromS3Bucket(element.album_path);
      }
    }

    await communities.updateOne(
      {
        _id: community_id,
      },
      {
        $set: { is_deleted: true },
      },
    );

    await notifications.deleteMany({ community_id: community_id });
    await successRes(
      res,
      res.__("The community has been successfully deleted."),
      [],
    );
    return;
  } catch (error) {
    console.log("Error:", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const uploadCommunityMedia = async (
  req: IUserRequest,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { community_id, album_type, ln } = req.body;
    i18n.setLocale(req, ln);

    const folder_name = "community_media";
    const folder_name_thumbnail = "video_thumbnail";

    if (!req.files || typeof req.files !== "object") {
      await errorRes(res, res.__("No files were uploaded."));
      return;
    }
    const convertToMediaFile = (file: Express.Multer.File): MediaFile => ({
      originalFilename: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      data: fs.readFileSync(file.path),
    });

    let album =
      (req.files as { [key: string]: Express.Multer.File[] })["album"]?.map(
        convertToMediaFile,
      ) || [];
    let thumbnail =
      (req.files as { [key: string]: Express.Multer.File[] })["thumbnail"]?.map(
        convertToMediaFile,
      ) || [];

    if (!album) {
      await errorRes(res, res.__("Album file is missing."));
      return;
    }

    if (!Array.isArray(album)) {
      album = [album];
    }

    if (thumbnail && !Array.isArray(thumbnail)) {
      thumbnail = [thumbnail];
    }

    let albumType: string[] = [];
    if (album_type) {
      albumType = JSON.parse(album_type);
    }

    const uploadedFiles = [];

    for (let i = 0; i < albumType.length; i++) {
      const album_type_i = albumType[i];
      const media = thumbnail[0];
      const content_type = media.mimetype || "image/jpeg";
      const fileData = fs.readFileSync(media.path);

      const mediaFile = {
        originalFilename: media.originalFilename,
        path: media.path,
        mimetype: media.mimetype,
        data: fileData,
      };

      const res_upload_file = await uploadMediaIntoS3Bucket(
        mediaFile,
        folder_name,
        content_type,
      );

      if (res_upload_file.status) {
        const user_image_path = `${folder_name}/` + res_upload_file.file_name;

        if (album_type_i === "image") {
          interface CommunityAlbumData {
            user_id: string;
            community_id: string;
            album_type: string;
            album_thumbnail?: string;
            album_path: string;
          }

          const fileData: CommunityAlbumData = {
            user_id,
            community_id,
            album_type: album_type_i,
            album_thumbnail: null,
            album_path: user_image_path,
          };

          const add_albums = await communities_albums.create(fileData);

          add_albums.album_path =
            process.env.BUCKET_URL + add_albums.album_path;
          uploadedFiles.push(add_albums);
        }

        if (album_type_i === "video") {
          let thumbnail_image_path: string | null = null;

          if (thumbnail && thumbnail[i]) {
            const res_upload_thumb = await uploadMediaIntoS3Bucket(
              thumbnail[i],
              folder_name_thumbnail,
              "image/jpeg",
            );

            if (res_upload_thumb.status) {
              thumbnail_image_path = `${folder_name_thumbnail}/${res_upload_thumb.file_name}`;
            }
          }

          const fileData = {
            user_id,
            community_id,
            album_type: album_type_i,
            album_thumbnail: thumbnail_image_path,
            album_path: user_image_path,
          };

          const add_albums = await communities_albums.create(fileData);

          add_albums.album_path =
            process.env.BUCKET_URL + add_albums.album_path;
          add_albums.album_thumbnail = thumbnail_image_path
            ? process.env.BUCKET_URL + thumbnail_image_path
            : undefined;

          uploadedFiles.push(add_albums);
        }
      } else {
        await errorRes(
          res,
          res.__("Media upload failed for one of the files."),
        );
        return;
      }
    }

    await successRes(
      res,
      res.__("Community media uploaded successfully."),
      uploadedFiles,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const removeCommunityMedia = async (
  req: IUserRequest,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { album_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const userAlbum = await findCommunityAlbumById(album_id, user_id);

    interface ErrorResponse {
      status: "error";
      message: string;
    }

    if (!userAlbum || (userAlbum as ErrorResponse).status === "error") {
      await errorRes(res, res.__("Album not found."));
      return;
    }

    const album = userAlbum as ICommunityAlbum;

    const res_remove_file = await removeMediaFromS3Bucket(album.album_path);

    if (album.album_type === "video" && album.album_thumbnail) {
      await removeMediaFromS3Bucket(album.album_thumbnail);
    }

    if (res_remove_file.status) {
      await communities_albums.deleteOne({ _id: album_id });
      await successRes(res, res.__("Media removed successfully."), []);
    } else {
      await errorRes(res, res.__("Failed to remove community media."));
    }
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
  }
};

export const communityDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { community_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_community = await findCommunity(community_id);

    if (!find_community) {
      await errorRes(res, res.__("Community not found."));
      return;
    }

    const communityObjectId = await objectId(community_id);

    const community_detail = await communities.aggregate([
      {
        $match: {
          _id: communityObjectId,
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
          from: "communities_albums",
          let: {
            communityId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$community_id", "$$communityId"] }],
                },
              },
            },
          ],
          as: "communities_album",
        },
      },
      {
        $addFields: {
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
          communities_media: {
            $map: {
              input: "$communities_album",
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
          title: 1,
          location: 1,
          address: 1,
          description: 1,
          is_deleted: 1,
          communities_media: 1,
          user_profile: 1,
          full_name: "$user_details.full_name",
        },
      },
    ]);

    await successRes(
      res,
      res.__("Community detail get successfully."),
      community_detail,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const communityUpdatedData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { community_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const communityObjectId = await objectId(community_id);

    const community_detail = await communities.aggregate([
      {
        $match: {
          _id: communityObjectId,
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: "communities_albums",
          let: {
            communityId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$community_id", "$$communityId"] }],
                },
              },
            },
          ],
          as: "communities_album",
        },
      },
      {
        $addFields: {
          communities_media: {
            $map: {
              input: "$communities_album",
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
          title: 1,
          location: 1,
          address: 1,
          description: 1,
          is_deleted: 1,
          communities_media: 1,
        },
      },
    ]);

    await successRes(
      res,
      res.__("Successfully updated community data."),
      community_detail,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const communityListing = async (
  req: IUserRequest,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const {
      search = "",
      page = 1,
      limit = 10,
      lat,
      long,
      miles_distance = 100,
      ln,
    } = req.body;
    i18n.setLocale(req, ln);

    const escapedSearch = search ? await escapeRegex(search) : null;

    const query: Record<string, unknown> = {
      is_deleted: false,
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
      const minLong =
        long1 - (radians * (180 / Math.PI)) / Math.cos((lat1 * Math.PI) / 180);
      const maxLong =
        long1 + (radians * (180 / Math.PI)) / Math.cos((lat1 * Math.PI) / 180);

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
        { title: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const total_communities = await communities.countDocuments(query);

    const communities_list = await communities.aggregate([
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
          from: "communities_albums",
          let: {
            communityId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$community_id", "$$communityId"] }],
                },
              },
            },
          ],
          as: "communities_album",
        },
      },
      {
        $lookup: {
          from: "user_albums",
          let: {
            userId: "$user_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$user_id", "$$userId"] }],
                },
              },
            },
          ],
          as: "user_album",
        },
      },
      {
        $addFields: {
          communities_media: {
            $map: {
              input: "$communities_album",
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
          user_media: {
            $cond: {
              if: { $gt: [{ $size: "$user_album" }, 0] },
              then: {
                $cond: {
                  if: {
                    $eq: [
                      { $arrayElemAt: ["$user_album.album_type", 0] },
                      "image",
                    ],
                  },
                  then: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$user_album.album_path", 0] },
                    ],
                  },
                  else: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$user_album.album_thumbnail", 0] },
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
          title: 1,
          location: 1,
          address: 1,
          description: 1,
          is_deleted: 1,
          communities_media: 1,
          user_media: 1,
          createdAt: 1,
          full_name: "$user_details.full_name",
        },
      },
    ]);

    await multiSuccessRes(
      res,
      res.__("Communities list get successfully."),
      total_communities,
      communities_list,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const guestCommunityListing = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      search = "",
      page = 1,
      limit = 10,
      lat,
      long,
      miles_distance = 100,
      ln,
    } = req.body;
    i18n.setLocale(req, ln);

    const escapedSearch = search ? await escapeRegex(search) : null;

    const query: Record<string, unknown> = {
      is_deleted: false,
    };

    if (lat && long) {
      const earthRadiusInMiles = 3963.2;
      const distanceInMiles = parseInt(miles_distance);

      const lat1 = parseFloat(lat);
      const long1 = parseFloat(long);

      const radians = distanceInMiles / earthRadiusInMiles;

      const minLat = lat1 - radians * (180 / Math.PI);
      const maxLat = lat1 + radians * (180 / Math.PI);
      const minLong =
        long1 - (radians * (180 / Math.PI)) / Math.cos((lat1 * Math.PI) / 180);
      const maxLong =
        long1 + (radians * (180 / Math.PI)) / Math.cos((lat1 * Math.PI) / 180);

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
        { title: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const total_communities = await communities.countDocuments(query);

    const communities_list = await communities.aggregate([
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
          from: "communities_albums",
          let: {
            communityId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$community_id", "$$communityId"] }],
                },
              },
            },
          ],
          as: "communities_album",
        },
      },
      {
        $lookup: {
          from: "user_albums",
          let: {
            userId: "$user_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$user_id", "$$userId"] }],
                },
              },
            },
          ],
          as: "user_album",
        },
      },
      {
        $addFields: {
          communities_media: {
            $map: {
              input: "$communities_album",
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
          user_media: {
            $cond: {
              if: { $gt: [{ $size: "$user_album" }, 0] },
              then: {
                $cond: {
                  if: {
                    $eq: [
                      { $arrayElemAt: ["$user_album.album_type", 0] },
                      "image",
                    ],
                  },
                  then: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$user_album.album_path", 0] },
                    ],
                  },
                  else: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$user_album.album_thumbnail", 0] },
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
          title: 1,
          location: 1,
          address: 1,
          description: 1,
          is_deleted: 1,
          communities_media: 1,
          user_media: 1,
          createdAt: 1,
          full_name: "$user_details.full_name",
        },
      },
    ]);

    await multiSuccessRes(
      res,
      res.__("Communities list get successfully."),
      total_communities,
      communities_list,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const userCommunityListing = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { profile_user_id, page = 1, limit = 10, ln } = req.body;
    i18n.setLocale(req, ln);

    const profileObjectId = await objectId(profile_user_id);

    const query = {
      is_deleted: false,
      user_id: profileObjectId,
    };

    const total_communities = await communities.countDocuments(query);

    const communities_list = await communities.aggregate([
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
          from: "communities_albums",
          let: {
            communityId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$community_id", "$$communityId"] }],
                },
              },
            },
          ],
          as: "communities_album",
        },
      },
      {
        $lookup: {
          from: "user_albums",
          let: {
            userId: "$user_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$user_id", "$$userId"] }],
                },
              },
            },
          ],
          as: "user_album",
        },
      },
      {
        $addFields: {
          communities_media: {
            $map: {
              input: "$communities_album",
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
          user_media: {
            $cond: {
              if: { $gt: [{ $size: "$user_album" }, 0] },
              then: {
                $cond: {
                  if: {
                    $eq: [
                      { $arrayElemAt: ["$user_album.album_type", 0] },
                      "image",
                    ],
                  },
                  then: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$user_album.album_path", 0] },
                    ],
                  },
                  else: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$user_album.album_thumbnail", 0] },
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
          title: 1,
          location: 1,
          address: 1,
          description: 1,
          is_deleted: 1,
          communities_media: 1,
          user_media: 1,
          createdAt: 1,
          full_name: "$user_details.full_name",
        },
      },
    ]);

    await multiSuccessRes(
      res,
      res.__("Communities list get successfully."),
      total_communities,
      communities_list,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

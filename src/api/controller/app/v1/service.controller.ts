import i18n from "i18n";
import { Request, Response } from "express";
import { FilterQuery } from "mongoose";
import { services } from "./../../../model/model.services";
import { users } from "./../../../model/model.users";
import { notifications } from "./../../../model/model.notifications";
import { guests } from "./../../../model/model.guests";
import { service_albums } from "./../../../model/model.service_albums";
import { service_likes } from "./../../../model/model.service_likes";
import { IUser } from "./../../../model/model.users";
import { Types } from "mongoose";
import { MediaFile } from "./../../../../util/bucket_manager";

export interface IUserRequest extends Request {
  user: {
    _id: string;
    [key: string]: unknown;
  };
}

interface NotificationData {
  device_token: string[];
  noti_title: string;
  noti_msg: string;
  noti_for: string;
  id: string;
  sound_name: string;
  noti_image?: string;
  chat_room_id?: string;
  sender_id?: string;
}

interface ServiceAlbum {
  album_type: string;
  album_path: string;
  album_thumbnail?: string;
}

import {
  errorRes,
  successRes,
  multiSuccessRes,
} from "./../../../../util/response_functions";

import { multiNotificationSend } from "./../../../../util/send_notifications";

import {
  findService,
  findMultipleUserDeviceToken,
  incMultipleUserNotificationBadge,
  findServiceLike,
  escapeRegex,
  objectId,
  findUsersService,
  findServiceAlbums,
  findServiceAlbumById,
} from "./../../../../util/user_function";

import {
  uploadMediaIntoS3Bucket,
  removeMediaFromS3Bucket,
} from "./../../../../util/bucket_manager";

export const addService = async (
  req: IUserRequest,
  res: Response,
): Promise<Response> => {
  try {
    const user_id = req.user._id;

    const { service_name, location, address, price, description, ln } =
      req.body;

    i18n.setLocale(req, ln);

    const insert_data = {
      user_id: user_id,
      service_name: service_name,
      address: address,
      price: price,
      description: description,
      location: location || null,
    };

    if (location) {
      const location_json_parse = JSON.parse(location);
      insert_data.location = location_json_parse;
    }

    const newService = await services.create(insert_data);

    if (newService) {
      const userObjectId = await objectId(user_id);

      const location_parse = JSON.parse(location);
      const find_nearby_users = await users.find({
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
            $maxDistance: 160934, //Distance in meters  - 50 miles
          },
        },
      });

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
            $maxDistance: 160934, //Distance in meters  - 50 miles
          },
        },
      });

      const nearUserIds = find_nearby_users.map((user) => user._id);
      const nearUserDeviceTokens = find_nearby_guest_users.map(
        (user) => user.device_token,
      );

      const deviceTokenData = await findMultipleUserDeviceToken(
        nearUserIds.map(String),
      );

      const noti_msg = `A new ${newService.service_name} is now available in your area!`;
      const noti_title = "New Service Nearby";
      const noti_for = "new_service";

      await notifications.create({
        sender_id: userObjectId,
        receiver_ids: nearUserIds,
        noti_title: noti_title,
        noti_msg: `A new service_name is now available in your area!`,
        noti_for: noti_for,
        service_id: newService._id,
      });

      if (Array.isArray(deviceTokenData) && deviceTokenData.length > 0) {
        const notificationData = {
          device_token: deviceTokenData,
          noti_title,
          noti_msg,
          noti_for,
          id: newService._id.toString(),
        };
        multiNotificationSend(notificationData);
        incMultipleUserNotificationBadge(nearUserIds.map(String));
      }

      const notiDataGuest = {
        noti_msg,
        noti_title,
        noti_for,
        device_token: nearUserDeviceTokens,
        service_id: newService._id,
        id: newService._id,
        sound_name: "default", // Add the required sound_name property
      };

      if (
        Array.isArray(nearUserDeviceTokens) &&
        nearUserDeviceTokens.length > 0
      ) {
        multiNotificationSend(notiDataGuest as NotificationData);
      }
    }

    return successRes(
      res,
      res.__("The service has been successfully added."),
      newService,
    );
  } catch (error) {
    console.error("Error:", error);
    return errorRes(res, res.__("Internal server error"));
  }
};

export const addMultipleServices = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;

    const { service_name, location, address, price, description, ln } =
      req.body;

    i18n.setLocale(req, ln);

    for (let i = 1; i <= 500; i++) {
      const insert_data = {
        user_id: user_id,
        service_name: `${service_name} ${i}`,
        address: address,
        price: price,
        description: description,
        location: location || null,
      };

      if (location) {
        const location_json_parse = JSON.parse(location);
        insert_data.location = location_json_parse;
      }

      const newService = await services.create(insert_data);

      interface ServiceAlbumInsertData {
        user_id: Types.ObjectId;
        service_id: Types.ObjectId;
        album_type: "image" | "video";
        album_thumbnail: string | null;
        album_path: string;
      }

      const albumPayload: ServiceAlbumInsertData = {
        user_id,
        service_id: newService._id as Types.ObjectId,
        album_type: "image",
        album_thumbnail: null,
        album_path: "service_media/1043_1749735486495.jpg",
      };

      await service_albums.create(albumPayload);

      console.log("No of service: ", i);
    }
  } catch (error) {
    console.log("Error in addMultipleServices:", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const editService = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;

    const {
      service_id,
      service_name,
      location,
      address,
      price,
      description,
      ln,
    } = req.body;

    i18n.setLocale(req, ln);

    const find_service = await findService(service_id);

    if (!find_service) {
      await errorRes(res, res.__("Service not found."));
      return;
    }

    const find_users_service = await findUsersService(user_id, service_id);

    if (!find_users_service) {
      await errorRes(
        res,
        res.__("You don't have permission to edit this service."),
      );
      return;
    }

    const updated_data = {
      service_name: service_name,
      address: address,
      price: price,
      description: description,
      location: location || null,
    };

    if (location) {
      const location_json_parse = JSON.parse(location);
      updated_data.location = location_json_parse;
    }

    await services.updateOne(
      {
        _id: service_id,
      },
      {
        $set: updated_data,
      },
    );

    const updated_service = await findService(service_id);

    await successRes(
      res,
      res.__("The service has been successfully updated."),
      updated_service,
    );
    return;
  } catch (error) {
    console.log("Error:", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const deleteService = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;

    const { service_id, ln } = req.body;

    i18n.setLocale(req, ln);

    const find_service = await findService(service_id);

    if (!find_service) {
      await errorRes(res, res.__("Service not found."));
      return;
    }

    const find_users_service = await findUsersService(user_id, service_id);

    if (!find_users_service) {
      await errorRes(
        res,
        res.__("You don't have permission to delete this service."),
      );
      return;
    }

    const find_all_service_albums = await findServiceAlbums(
      user_id,
      service_id,
    );

    for (const element of find_all_service_albums as ServiceAlbum[]) {
      if (element.album_type === "video") {
        await removeMediaFromS3Bucket(element.album_path);
        await removeMediaFromS3Bucket(element.album_thumbnail);
      } else {
        await removeMediaFromS3Bucket(element.album_path);
      }
    }

    await services.updateOne(
      {
        _id: service_id,
      },
      {
        $set: { is_deleted: true },
      },
    );

    await service_likes.deleteMany({ service_id: service_id });
    await notifications.deleteMany({ service_id: service_id });

    await successRes(
      res,
      res.__("The service has been successfully deleted."),
      [],
    );
    return;
  } catch (error) {
    console.log("Error:", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const likeDislikeServices = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;

    const { service_id, is_like, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_service = await findService(service_id);

    if (!find_service) {
      await errorRes(res, res.__("Service not found."));
      return;
    }

    if (is_like === true || is_like === "true") {
      const find_like = await findServiceLike(user_id, service_id);

      if (find_like) {
        await successRes(res, res.__("Service liked successfully."), []);
        return;
      } else {
        await service_likes.create({
          user_id: user_id,
          service_id: service_id,
        });

        await successRes(res, res.__("Service liked successfully."), []);
        return;
      }
    } else {
      await service_likes.deleteOne({
        user_id: user_id,
        service_id: service_id,
      });

      await successRes(res, res.__("Service disliked successfully."), []);
      return;
    }
  } catch (error) {
    console.error(error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const uploadServiceMedia = async (
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  req: Request & { user: { _id: string }; files?: any },
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { service_id, album_type, ln } = req.body as {
      service_id: string;
      album_type?: string;
      ln: string;
    };

    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    let { album, thumbnail }: { album: any; thumbnail?: any } = req.files ?? {};

    i18n.setLocale(req, ln);

    /* ---------- normalise to arrays ---------- */
    if (album && !Array.isArray(album)) album = [album];
    if (thumbnail && !Array.isArray(thumbnail)) thumbnail = [thumbnail];

    if (!album || !Array.isArray(album)) {
      errorRes(res, res.__("No media files provided."));
      return;
    }

    const albumType: string[] = album_type ? JSON.parse(album_type) : [];
    const uploadedFiles: unknown[] = [];

    const folder_name = "service_media";
    const folder_name_thumbnail = "video_thumbnail";

    /* ---------- loop through each file ---------- */
    for (let i = 0; i < albumType.length; i++) {
      const album_type_i = albumType[i];
      const media = album[i];
      if (!media) {
        errorRes(res, res.__("Media upload failed for one of the files."));
        return;
      }

      const content_type = media.type;
      const mediaFile: MediaFile = {
        originalFilename: media.originalFilename,
        path: media.path,
        mimetype: media.type,
        data: Buffer.alloc(0),
      };

      const res_upload_file = await uploadMediaIntoS3Bucket(
        mediaFile,
        folder_name,
        content_type,
      );

      if (!res_upload_file.status) {
        errorRes(res, res.__("Media upload failed for one of the files."));
        return;
      }

      /* ---------- image branch ---------- */
      if (album_type_i === "image") {
        const user_image_path = `${folder_name}/` + res_upload_file.file_name;

        const add_albums = await service_albums.create({
          user_id,
          service_id,
          album_type: album_type_i,
          album_thumbnail: null,
          album_path: user_image_path,
        });

        add_albums.album_path = process.env.BUCKET_URL + add_albums.album_path;

        uploadedFiles.push(add_albums);
        continue;
      }

      /* ---------- video branch ---------- */
      if (album_type_i === "video") {
        const file_name = res_upload_file.file_name!;
        const user_image_path = `${folder_name}/${file_name}`;
        let thumbnail_image_path: string | null = null;

        if (thumbnail && thumbnail[i]) {
          const thumbSrc = thumbnail[i];
          const thumbMedia: MediaFile = {
            originalFilename: thumbSrc.originalFilename,
            path: thumbSrc.path,
            mimetype: thumbSrc.type,
            data: Buffer.alloc(0),
          };

          const res_upload_thumb = await uploadMediaIntoS3Bucket(
            thumbMedia,
            folder_name_thumbnail,
            thumbSrc.type,
          );

          if (!res_upload_thumb.status) {
            errorRes(res, res.__("Media upload failed for one of the files."));
            return;
          }

          thumbnail_image_path = `${folder_name_thumbnail}/${res_upload_thumb.file_name}`;
        }

        const add_albums = await service_albums.create({
          user_id,
          service_id,
          album_type: album_type_i,
          album_thumbnail: thumbnail_image_path,
          album_path: user_image_path,
        });

        add_albums.album_path = process.env.BUCKET_URL + add_albums.album_path;
        if (thumbnail_image_path) {
          add_albums.album_thumbnail =
            process.env.BUCKET_URL + add_albums.album_thumbnail;
        }

        uploadedFiles.push(add_albums);
      }
    }

    successRes(
      res,
      res.__("Service media uploaded successfully."),
      uploadedFiles,
    );
  } catch (error) {
    console.error("Error :", error);
    errorRes(res, res.__("Internal server error"));
  }
};

export const removeServiceMedia = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { album_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const userAlbum = await findServiceAlbumById(album_id, user_id);

    if (!userAlbum) {
      await errorRes(res, res.__("Album not found."));
      return;
    } else if ("album_path" in userAlbum) {
      const res_remove_file = await removeMediaFromS3Bucket(
        userAlbum.album_path,
      );
      if (userAlbum.album_type === "video" && userAlbum.album_thumbnail) {
        await removeMediaFromS3Bucket(userAlbum.album_thumbnail);
      }

      if (res_remove_file.status) {
        await service_albums.deleteOne({
          _id: album_id,
        });

        await successRes(res, res.__("Media removed successfully."), []);
        return;
      } else {
        await errorRes(res, res.__("Failed to remove service media."));
        return;
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const serviceDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { service_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_service = await findService(service_id);

    if (!find_service) {
      await errorRes(res, res.__("Service not found."));
      return;
    }

    const serviceObjectId = await objectId(service_id);

    const service_detail = await services.aggregate([
      {
        $match: {
          _id: serviceObjectId,
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
          from: "service_likes",
          let: { localId: "$_id", userId: user_id },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user_id", "$$userId"] },
                    { $eq: ["$service_id", "$$localId"] },
                  ],
                },
              },
            },
          ],
          as: "service_like",
        },
      },
      {
        $lookup: {
          from: "service_albums",
          let: {
            serviceId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$service_id", "$$serviceId"] }],
                },
              },
            },
          ],
          as: "service_album",
        },
      },
      {
        $addFields: {
          is_user_liked: {
            $cond: {
              if: { $gt: [{ $size: "$service_like" }, 0] },
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
          service_media: {
            $map: {
              input: "$service_album",
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
          service_name: 1,
          location: 1,
          address: 1,
          price: 1,
          description: 1,
          is_deleted: 1,
          is_user_liked: 1,
          service_media: 1,
          user_profile: 1,
          full_name: "$user_details.full_name",
          createdAt: "$user_details.createdAt",
        },
      },
    ]);

    await successRes(
      res,
      res.__("Service detail get successfully."),
      service_detail,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const guestServiceDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { service_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_service = await findService(service_id);
    if (!find_service) {
      await errorRes(res, res.__("Service not found."));
      return;
    }

    const serviceObjectId = await objectId(service_id);

    const service_detail = await services.aggregate([
      {
        $match: {
          _id: serviceObjectId,
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
          from: "service_albums",
          let: {
            serviceId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$service_id", "$$serviceId"] }],
                },
              },
            },
          ],
          as: "service_album",
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
          service_media: {
            $map: {
              input: "$service_album",
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
          service_name: 1,
          location: 1,
          address: 1,
          price: 1,
          description: 1,
          is_deleted: 1,
          is_user_liked: 1,
          service_media: 1,
          user_profile: 1,
          full_name: "$user_details.full_name",
          createdAt: "$user_details.createdAt",
        },
      },
    ]);

    await successRes(
      res,
      res.__("Service detail get successfully."),
      service_detail,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const serviceUpdatedData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { service_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const serviceObjectId = await objectId(service_id);

    const service_detail = await services.aggregate([
      {
        $match: {
          _id: serviceObjectId,
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: "service_albums",
          let: {
            serviceId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$service_id", "$$serviceId"] }],
                },
              },
            },
          ],
          as: "service_album",
        },
      },
      {
        $addFields: {
          service_media: {
            $map: {
              input: "$service_album",
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
          service_name: 1,
          location: 1,
          address: 1,
          price: 1,
          description: 1,
          is_deleted: 1,
          service_media: 1,
        },
      },
    ]);

    await successRes(
      res,
      res.__("Successfully updated service data."),
      service_detail,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const serviceListing = async (
  req: Request,
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

    if (escapedSearch) {
      query.$or = [
        { service_name: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

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
        { service_name: { $regex: escapedSearch, $options: "i" } },
        // { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const total_services = await services.countDocuments(query);

    const service_list = await services.aggregate([
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
          from: "service_likes",
          let: { localId: "$_id", userId: user_id },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user_id", "$$userId"] },
                    { $eq: ["$service_id", "$$localId"] },
                  ],
                },
              },
            },
          ],
          as: "service_like",
        },
      },
      {
        $lookup: {
          from: "service_albums",
          let: {
            serviceId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$service_id", "$$serviceId"] }],
                },
              },
            },
          ],
          as: "service_album",
        },
      },
      {
        $addFields: {
          is_user_liked: {
            $cond: {
              if: { $gt: [{ $size: "$service_like" }, 0] },
              then: true,
              else: false,
            },
          },
          service_media: {
            $cond: {
              if: { $gt: [{ $size: "$service_album" }, 0] },
              then: {
                $cond: {
                  if: {
                    $eq: [
                      { $arrayElemAt: ["$service_album.album_type", 0] },
                      "image",
                    ],
                  },
                  then: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$service_album.album_path", 0] },
                    ],
                  },
                  else: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$service_album.album_thumbnail", 0] },
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
          service_name: 1,
          location: 1,
          address: 1,
          price: 1,
          description: 1,
          is_deleted: 1,
          is_user_liked: 1,
          service_media: 1,
        },
      },
    ]);

    await multiSuccessRes(
      res,
      res.__("Services list get successfully."),
      total_services,
      service_list,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const guestServiceListing = async (
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

    const query: FilterQuery<IUser> = {
      is_deleted: false,
    };

    if (escapedSearch) {
      query.$or = [
        { service_name: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

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
        { service_name: { $regex: escapedSearch, $options: "i" } },
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const total_services = await services.countDocuments(query);

    const service_list = await services.aggregate([
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
          from: "service_albums",
          let: {
            serviceId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$service_id", "$$serviceId"] }],
                },
              },
            },
          ],
          as: "service_album",
        },
      },
      {
        $addFields: {
          is_user_liked: false,
          service_media: {
            $cond: {
              if: { $gt: [{ $size: "$service_album" }, 0] },
              then: {
                $cond: {
                  if: {
                    $eq: [
                      { $arrayElemAt: ["$service_album.album_type", 0] },
                      "image",
                    ],
                  },
                  then: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$service_album.album_path", 0] },
                    ],
                  },
                  else: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$service_album.album_thumbnail", 0] },
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
          service_name: 1,
          location: 1,
          address: 1,
          price: 1,
          description: 1,
          is_deleted: 1,
          is_user_liked: 1,
          service_media: 1,
        },
      },
    ]);

    await multiSuccessRes(
      res,
      res.__("Services list get successfully."),
      total_services,
      service_list,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const serviceFavoriteList = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { page = 1, limit = 10, ln } = req.body;
    i18n.setLocale(req, ln);

    const total_services = await service_likes.countDocuments({
      user_id: user_id,
    });

    const service_list = await service_likes.aggregate([
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
          from: "services",
          let: { localId: "$service_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$localId"] }],
                },
              },
            },
          ],
          as: "service_detail",
        },
      },
      {
        $unwind: {
          path: "$service_detail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "service_albums",
          let: {
            serviceId: "$service_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$service_id", "$$serviceId"] }],
                },
              },
            },
          ],
          as: "service_album",
        },
      },
      {
        $addFields: {
          is_user_liked: true,
          service_media: {
            $cond: {
              if: { $gt: [{ $size: "$service_album" }, 0] },
              then: {
                $cond: {
                  if: {
                    $eq: [
                      { $arrayElemAt: ["$service_album.album_type", 0] },
                      "image",
                    ],
                  },
                  then: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$service_album.album_path", 0] },
                    ],
                  },
                  else: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$service_album.album_thumbnail", 0] },
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
          _id: "$service_detail._id",
          user_id: "$service_detail.user_id",
          service_name: "$service_detail.service_name",
          location: "$service_detail.location",
          address: "$service_detail.address",
          price: "$service_detail.price",
          description: "$service_detail.description",
          is_deleted: "$service_detail.is_deleted",
          is_user_liked: 1,
          service_media: 1,
        },
      },
    ]);

    await multiSuccessRes(
      res,
      res.__("Service favorites list get successfully."),
      total_services,
      service_list,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const userServiceListing = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { profile_user_id, page = 1, limit = 10, ln } = req.body;
    i18n.setLocale(req, ln);

    const profileObjectId = await objectId(profile_user_id);

    const query = {
      is_deleted: false,
      user_id: profileObjectId,
    };

    const total_services = await services.countDocuments(query);

    const service_list = await services.aggregate([
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
          from: "service_likes",
          let: { localId: "$_id", userId: user_id },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user_id", "$$userId"] },
                    { $eq: ["$service_id", "$$localId"] },
                  ],
                },
              },
            },
          ],
          as: "service_like",
        },
      },
      {
        $lookup: {
          from: "service_albums",
          let: {
            serviceId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$service_id", "$$serviceId"] }],
                },
              },
            },
          ],
          as: "service_album",
        },
      },
      {
        $addFields: {
          is_user_liked: {
            $cond: {
              if: { $gt: [{ $size: "$service_like" }, 0] },
              then: true,
              else: false,
            },
          },
          service_media: {
            $cond: {
              if: { $gt: [{ $size: "$service_album" }, 0] },
              then: {
                $cond: {
                  if: {
                    $eq: [
                      { $arrayElemAt: ["$service_album.album_type", 0] },
                      "image",
                    ],
                  },
                  then: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$service_album.album_path", 0] },
                    ],
                  },
                  else: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$service_album.album_thumbnail", 0] },
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
          service_name: 1,
          location: 1,
          address: 1,
          price: 1,
          description: 1,
          is_deleted: 1,
          is_user_liked: 1,
          service_media: 1,
        },
      },
    ]);

    await multiSuccessRes(
      res,
      res.__("Services list get successfully."),
      total_services,
      service_list,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const guestUserServiceList = async (
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

    const total_services = await services.countDocuments(query);

    const service_list = await services.aggregate([
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
          from: "service_albums",
          let: {
            serviceId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$service_id", "$$serviceId"] }],
                },
              },
            },
          ],
          as: "service_album",
        },
      },
      {
        $addFields: {
          service_media: {
            $cond: {
              if: { $gt: [{ $size: "$service_album" }, 0] },
              then: {
                $cond: {
                  if: {
                    $eq: [
                      { $arrayElemAt: ["$service_album.album_type", 0] },
                      "image",
                    ],
                  },
                  then: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$service_album.album_path", 0] },
                    ],
                  },
                  else: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$service_album.album_thumbnail", 0] },
                    ],
                  },
                },
              },
              else: null,
            },
          },
          is_user_liked: false,
        },
      },
      {
        $project: {
          _id: 1,
          user_id: 1,
          service_name: 1,
          location: 1,
          address: 1,
          price: 1,
          description: 1,
          is_deleted: 1,
          is_user_liked: 1,
          service_media: 1,
        },
      },
    ]);

    await multiSuccessRes(
      res,
      res.__("Services list get successfully."),
      total_services,
      service_list,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

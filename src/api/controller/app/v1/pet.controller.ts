import i18n from "i18n";
import { Request, Response } from "express";
import { pets } from "../../../model/model.pets";
import { pet_albums } from "../../../model/model.pet_albums";
import { users } from "../../../model/model.users";
import { payments } from "../../../model/model.payments";
import { guests } from "../../../model/model.guests";
import { notifications } from "../../../model/model.notifications";
import { pet_likes } from "../../../model/model.pet_likes";
import { MediaFile } from "./../../../../util/bucket_manager";
import { Buffer } from "buffer";

import {
  errorRes,
  successRes,
  multiSuccessRes,
} from "./../../../../util/response_functions";
import { multiNotificationSend } from "./../../../../util/send_notifications";

import {
  findPet,
  findMultipleUserDeviceToken,
  incMultipleUserNotificationBadge,
  findPetLike,
  escapeRegex,
  objectId,
  findUsersPet,
  findPetAlbums,
  findPetAlbumById,
} from "./../../../../util/user_function";

import {
  uploadMediaIntoS3Bucket,
  removeMediaFromS3Bucket,
} from "./../../../../util/bucket_manager";

interface LocationPoint {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}
interface PetInsertData {
  user_id: string;
  pet_name: string;
  pet_type: string;
  pet_breed: string;
  address: string;
  gender: string;
  price: number;
  description: string;
  location?: LocationPoint;
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

export const addPet = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.user._id;

    const {
      pet_name,
      pet_type,
      pet_breed,
      location,
      address,
      gender,
      price,
      description,
      ln = "en",
    } = req.body;

    i18n.setLocale(req, ln);
    const locationPoint: LocationPoint | undefined = location
      ? (JSON.parse(location) as LocationPoint)
      : undefined;

    const insert_data: PetInsertData = {
      user_id,
      pet_name,
      pet_type,
      pet_breed,
      address,
      gender,
      price: price ? Number(price) : undefined,
      description,
      ...(locationPoint ? { location: locationPoint } : {}),
    };

    const newPet = await pets.create(insert_data);

    if (newPet && locationPoint) {
      if (newPet && locationPoint) {
        const userObjectId = await objectId(user_id);

        // Find users & guests near this location (50 miles ≈ 160,934 m)
        const [nearUsers, nearGuests] = await Promise.all([
          users.find({
            _id: { $ne: user_id },
            is_deleted: false,
            is_blocked_by_admin: false,
            location: {
              $near: {
                $geometry: {
                  type: "Point",
                  coordinates: [
                    locationPoint.coordinates[0],
                    locationPoint.coordinates[1],
                  ],
                },
                $maxDistance: 160_934,
              },
            },
          }),
          guests.find({
            location: {
              $near: {
                $geometry: {
                  type: "Point",
                  coordinates: [
                    locationPoint.coordinates[0],
                    locationPoint.coordinates[1],
                  ],
                },
                $maxDistance: 160_934,
              },
            },
          }),
        ]);

        const nearUserIds = nearUsers.map((u) => u._id);
        const guestDeviceTokens = nearGuests.map((g) => g.device_token);
        const userDeviceTokens = await findMultipleUserDeviceToken(
          nearUserIds as unknown as string[],
        );

        const noti_msg = `A new ${newPet.pet_name} is available for adoption near you!`;
        const noti_title = "New listing Alert!";
        const noti_for = "new_pet";

        // Registered users
        if (userDeviceTokens.length) {
          const notiData: NotificationData = {
            device_token: userDeviceTokens,
            noti_title,
            noti_msg,
            noti_for,
            id: newPet._id.toString(),
            sound_name: "default",
          };

          await notifications.create({
            sender_id: userObjectId,
            receiver_ids: nearUserIds,
            noti_title,
            noti_msg,
            noti_for,
            pet_id: newPet._id.toString(),
          });

          multiNotificationSend(notiData);
          incMultipleUserNotificationBadge(nearUserIds as unknown as string[]);
        }

        // Guest users
        if (guestDeviceTokens.length) {
          const notiDataGuest: NotificationData = {
            device_token: guestDeviceTokens,
            noti_title,
            noti_msg,
            noti_for,
            id: newPet._id.toString(),
            sound_name: "default",
          };

          multiNotificationSend(notiDataGuest);
        }
      }

      await successRes(
        res,
        res.__("The pet has been successfully added."),
        newPet,
      );
    }
  } catch (error) {
    console.error("addPet error:", error);
    await errorRes(res, res.__("Internal server error"));
  }
};

export const addMultiplePet = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;

    const {
      pet_name,
      pet_type,
      pet_breed,
      location,
      address,
      gender,
      price,
      description,
      ln,
    } = req.body;

    i18n.setLocale(req, ln);

    for (let i = 1; i <= 500; i++) {
      const insert_data: Record<string, unknown> = {
        user_id: user_id,
        pet_name: `${pet_name} ${i}`,
        pet_type: pet_type,
        pet_breed: pet_breed,
        address: address,
        gender: gender,
        price: price,
        description: description,
      };

      if (location) {
        const location_json_parse = JSON.parse(location);
        insert_data.location = location_json_parse;
      }

      const newPet = await pets.create(insert_data);

      interface PetAlbumData {
        user_id: string;
        pet_id: string;
        album_type: string;
        album_thumbnail: null;
        album_path: string;
      }

      const fileData: PetAlbumData = {
        user_id: user_id,
        pet_id: newPet._id.toString(),
        album_type: "image",
        album_thumbnail: null,
        album_path: "pet_media/7278_1749737449083.jpg",
      };

      await pet_albums.create(fileData);
      console.log("No of pet: ", i);
    }

    await successRes(res, res.__("The pets have been successfully added."), []);
    return;
  } catch (error) {
    console.log("Error:", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const editPet = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.user._id;

    const {
      pet_id,
      pet_name,
      pet_type,
      pet_breed,
      location,
      address,
      gender,
      price,
      description,
      ln,
    } = req.body;

    i18n.setLocale(req, ln);

    const find_pet = await findPet(pet_id);

    if (!find_pet) {
      await errorRes(res, res.__("Pet not found."));
      return;
    }

    const find_users_pet = await findUsersPet(user_id, pet_id);

    if (!find_users_pet) {
      await errorRes(
        res,
        res.__("You don't have permission to edit this pet."),
      );
      return;
    }

    interface updatePetData {
      pet_name: string;
      pet_type: string;
      pet_breed: string;
      address: string;
      gender: string;
      price: number;
      description: string;
      location?: unknown;
    }

    const updated_data: updatePetData = {
      pet_name: pet_name,
      pet_type: pet_type,
      pet_breed: pet_breed,
      address: address,
      gender: gender,
      price: price,
      description: description,
    };

    if (location) {
      const location_json_parse = JSON.parse(location);
      updated_data.location = location_json_parse;
    }

    await pets.updateOne(
      {
        _id: pet_id,
      },
      {
        $set: updated_data,
      },
    );

    const updated_pet = await findPet(pet_id);

    await successRes(
      res,
      res.__("The pet has been successfully updated."),
      updated_pet,
    );
    return;
  } catch (error) {
    console.log("Error:", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const deletePet = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.user._id;

    const { pet_id, ln } = req.body;

    i18n.setLocale(req, ln);

    const find_pet = await findPet(pet_id);

    if (!find_pet) {
      await errorRes(res, res.__("Pet not found."));
      return;
    }

    const find_users_pet = await findUsersPet(user_id, pet_id);

    if (!find_users_pet) {
      await errorRes(
        res,
        res.__("You don't have permission to delete this pet."),
      );
      return;
    }

    const find_all_pet_albums = await findPetAlbums(user_id, pet_id);

    if (Array.isArray(find_all_pet_albums)) {
      for (const element of find_all_pet_albums) {
        if (element.album_type === "video") {
          await removeMediaFromS3Bucket(element.album_path);
          if (element.album_thumbnail) {
            await removeMediaFromS3Bucket(element.album_thumbnail);
          }
        } else {
          await removeMediaFromS3Bucket(element.album_path);
        }
      }
    }

    await pets.updateOne(
      {
        _id: pet_id,
      },
      {
        $set: { is_deleted: true },
      },
    );

    await pet_likes.deleteMany({ pet_id: pet_id });
    await notifications.deleteMany({ pet_id: pet_id });
    await payments.deleteMany({ pet_id: pet_id });
    await pet_albums.deleteMany({ pet_id: pet_id });

    await successRes(res, res.__("The pet has been successfully deleted."), []);
    return;
  } catch (error) {
    console.log("Error:", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const adoptPet = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.user._id;

    const { pet_id, is_adopted, ln } = req.body;

    i18n.setLocale(req, ln);

    const find_pet = await findPet(pet_id);

    if (!find_pet) {
      await errorRes(res, res.__("Pet not found."));
      return;
    }

    const find_users_pet = await findUsersPet(user_id, pet_id);

    if (!find_users_pet) {
      await errorRes(
        res,
        res.__("You don't have permission to modify this pet."),
      );
      return;
    }

    if ("is_adopted" in find_pet) {
      if (is_adopted === true || is_adopted === "true") {
        if (
          (find_pet.is_adopted as unknown) === true ||
          (find_pet.is_adopted as unknown) === "true"
        ) {
          await successRes(
            res,
            res.__("The pet has already been marked as adopted."),
            [],
          );
          return;
        } else {
          await pets.updateOne(
            {
              _id: pet_id,
            },
            {
              $set: { is_adopted: true },
            },
          );

          await successRes(
            res,
            res.__("The pet has been successfully marked as adopted."),
            [],
          );
          return;
        }
      } else {
        if (
          (find_pet.is_adopted as unknown) === false ||
          (find_pet.is_adopted as unknown) === "false"
        ) {
          await successRes(
            res,
            res.__("The pet is already marked as available for adoption."),
            [],
          );
          return;
        } else {
          await pets.updateOne(
            {
              _id: pet_id,
            },
            {
              $set: { is_adopted: false },
            },
          );

          await successRes(
            res,
            res.__(
              "The pet has been successfully marked as available for adoption.",
            ),
            [],
          );
          return;
        }
      }
    }
  } catch (error) {
    console.log("Error:", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const likeDislikePets = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;

    const { pet_id, is_like, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_pet = await findPet(pet_id);

    if (!find_pet) {
      await errorRes(res, res.__("Pet not found."));
      return;
    }

    if (is_like === true || is_like === "true") {
      const find_like = await findPetLike(user_id, pet_id);

      if (find_like) {
        await successRes(res, res.__("Pet liked successfully."), []);
        return;
      } else {
        await pet_likes.create({ user_id: user_id, pet_id: pet_id });

        await successRes(res, res.__("Pet liked successfully."), []);
        return;
      }
    } else {
      await pet_likes.deleteOne({ user_id: user_id, pet_id: pet_id });

      await successRes(res, res.__("Pet disliked successfully."), []);
      return;
    }
  } catch (error) {
    console.error(error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export interface MultipartFile {
  fieldName: string;
  originalFilename: string;
  path: string;
  headers: {
    "content-disposition": string;
    "content-type": string;
  };
  size: number;
  name: string;
  type: string;
}
interface S3File {
  originalFilename: string;
  path: string;
  type: string;
  key: string;
  mimetype: string;
  name: string;
  headers: Record<string, string>;
  data: Buffer;
  [key: string]: unknown;
}

export const uploadPetMedia = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;

    const { pet_id, album_type, ln = "en" } = req.body;
    i18n.setLocale(req, ln);

    interface FilesObject {
      album?: S3File | S3File[];
      thumbnail?: S3File | S3File[];
    }

    const files = (req.files as unknown as FilesObject) ?? {};

    // Always work with arrays
    const albumFiles: S3File[] = files.album
      ? Array.isArray(files.album)
        ? files.album
        : [files.album]
      : [];

    const thumbnailFiles: S3File[] = files.thumbnail
      ? Array.isArray(files.thumbnail)
        ? files.thumbnail
        : [files.thumbnail]
      : [];

    const albumTypes: string[] = album_type ? JSON.parse(album_type) : [];
    const uploadedFiles: unknown[] = [];

    const mediaFolder = "pet_media";
    const thumbFolder = "video_thumbnail";
    const bucketUrl = process.env.BUCKET_URL ?? "";

    for (let i = 0; i < albumTypes.length; i += 1) {
      const currentType = albumTypes[i]; // "image" | "video"
      const mediaFile = albumFiles[i];

      // Skip if the arrays are mismatched
      if (!mediaFile) continue;

      const uploadRes = await uploadMediaIntoS3Bucket(
        {
          originalFilename: mediaFile.name,
          mimetype: mediaFile.type,
          data: mediaFile.data,
          path: mediaFile.path,
        } as MediaFile,
        mediaFolder,
        mediaFile.type,
      );

      if (!uploadRes.status) {
        await errorRes(
          res,
          res.__("Media upload failed for one of the files."),
        );
        return;
      }

      // Shared path variables
      const fileName = uploadRes.file_name;
      const mediaPath = `${mediaFolder}/${fileName}`;

      if (currentType === "image") {
        const doc = await pet_albums.create({
          user_id,
          pet_id,
          album_type: "image",
          album_thumbnail: null,
          album_path: mediaPath,
        });

        doc.album_path = bucketUrl + doc.album_path;
        uploadedFiles.push(doc);
        continue;
      }

      if (currentType === "video") {
        let thumbPath: string | null = null;

        if (thumbnailFiles[i]) {
          const thumbRes = await uploadMediaIntoS3Bucket(
            thumbnailFiles[i],
            thumbFolder,
            thumbnailFiles[i].type,
          );

          if (!thumbRes.status) {
            await errorRes(res, res.__("Thumbnail upload failed."));
            return;
          }

          thumbPath = `${thumbFolder}/${thumbRes.file_name}`;
        }

        const doc = await pet_albums.create({
          user_id,
          pet_id,
          album_type: "video",
          album_thumbnail: thumbPath,
          album_path: mediaPath,
        });

        doc.album_path = bucketUrl + doc.album_path;
        if (doc.album_thumbnail) {
          doc.album_thumbnail = bucketUrl + doc.album_thumbnail;
        }
        uploadedFiles.push(doc);
      }
    }

    /* ── Success response ───────────────────────────────────── */
    await successRes(
      res,
      res.__("Pet media uploaded successfully."),
      uploadedFiles,
    );
  } catch (err) {
    console.error("uploadPetMedia error:", err);
    await errorRes(res, res.__("Internal server error"));
  }
};

export const removePetMedia = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { album_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const userAlbum = await findPetAlbumById(album_id, user_id);

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
        await pet_albums.deleteOne({
          _id: album_id,
        });

        await successRes(res, res.__("Media removed successfully."), []);
        return;
      } else {
        await errorRes(res, res.__("Failed to remove pet media."));
        return;
      }
    }
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const petDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { pet_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_pet = await findPet(pet_id);

    if (!find_pet) {
      await errorRes(res, res.__("Pet not found."));
      return;
    }

    const petObjectId = await objectId(pet_id);

    const pet_detail = await pets.aggregate([
      {
        $match: {
          _id: petObjectId,
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
          from: "pet_likes",
          let: { localId: "$_id", userId: user_id },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user_id", "$$userId"] },
                    { $eq: ["$pet_id", "$$localId"] },
                  ],
                },
              },
            },
          ],
          as: "pet_like",
        },
      },
      {
        $lookup: {
          from: "pet_albums",
          let: {
            petId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$pet_id", "$$petId"] }],
                },
              },
            },
          ],
          as: "pet_album",
        },
      },
      {
        $addFields: {
          is_user_liked: {
            $cond: {
              if: { $gt: [{ $size: "$pet_like" }, 0] },
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
          pet_media: {
            $map: {
              input: "$pet_album",
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
          pet_name: 1,
          pet_type: 1,
          pet_breed: 1,
          location: 1,
          address: 1,
          gender: 1,
          price: 1,
          description: 1,
          is_adopted: 1,
          is_deleted: 1,
          is_user_liked: 1,
          pet_media: 1,
          user_profile: 1,
          full_name: "$user_details.full_name",
          createdAt: "$user_details.createdAt",
        },
      },
    ]);

    await successRes(res, res.__("Pet detail get successfully."), pet_detail);
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const guestPetDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { pet_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_pet = await findPet(pet_id);

    if (!find_pet) {
      await errorRes(res, res.__("Pet not found."));
      return;
    }

    const petObjectId = await objectId(pet_id);

    const pet_detail = await pets.aggregate([
      {
        $match: {
          _id: petObjectId,
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
          from: "pet_albums",
          let: {
            petId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$pet_id", "$$petId"] }],
                },
              },
            },
          ],
          as: "pet_album",
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
          pet_media: {
            $map: {
              input: "$pet_album",
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
          pet_name: 1,
          pet_type: 1,
          pet_breed: 1,
          location: 1,
          address: 1,
          gender: 1,
          price: 1,
          description: 1,
          is_adopted: 1,
          is_deleted: 1,
          is_user_liked: 1,
          pet_media: 1,
          user_profile: 1,
          full_name: "$user_details.full_name",
          createdAt: "$user_details.createdAt",
        },
      },
    ]);

    await successRes(res, res.__("Pet detail get successfully."), pet_detail);
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const petUpdatedData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { pet_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const petObjectId = await objectId(pet_id);

    const pet_detail = await pets.aggregate([
      {
        $match: {
          _id: petObjectId,
          is_adopted: false,
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: "pet_albums",
          let: {
            petId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$pet_id", "$$petId"] }],
                },
              },
            },
          ],
          as: "pet_album",
        },
      },
      {
        $addFields: {
          pet_media: {
            $map: {
              input: "$pet_album",
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
          pet_name: 1,
          pet_type: 1,
          pet_breed: 1,
          location: 1,
          address: 1,
          gender: 1,
          price: 1,
          description: 1,
          is_adopted: 1,
          is_deleted: 1,
          pet_media: 1,
        },
      },
    ]);

    await successRes(res, res.__("Successfully updated pet data."), pet_detail);
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const petListing = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const {
      search = "",
      pet_type,
      pet_breed,
      gender,
      page = 1,
      limit = 10,
      lat,
      long,
      miles_distance = 100,
      ln,
    } = req.body;
    i18n.setLocale(req, ln);

    console.log("req.body", req.body);

    const escapedSearch = search ? await escapeRegex(search) : null;

    const query: Record<string, unknown> = {
      is_deleted: false,
      is_adopted: false,
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

    let petType = [];
    let petBreed = [];
    let petGender = [];

    if (pet_type) {
      petType = JSON.parse(pet_type);
      query.pet_type = { $in: petType };
    }

    if (pet_breed) {
      petBreed = JSON.parse(pet_breed);
      query.pet_breed = { $in: petBreed };
    }

    if (gender) {
      petGender = JSON.parse(gender);
      query.gender = { $in: petGender };
    }

    if (escapedSearch) {
      query.$or = [
        { pet_name: { $regex: escapedSearch, $options: "i" } },
        { pet_type: { $regex: escapedSearch, $options: "i" } },
        { pet_breed: { $regex: escapedSearch, $options: "i" } },
        { gender: { $regex: escapedSearch, $options: "i" } },
        // { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const total_pets = await pets.countDocuments(query);

    const pet_list = await pets.aggregate([
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
          from: "pet_likes",
          let: { localId: "$_id", userId: user_id },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user_id", "$$userId"] },
                    { $eq: ["$pet_id", "$$localId"] },
                  ],
                },
              },
            },
          ],
          as: "pet_like",
        },
      },
      {
        $lookup: {
          from: "pet_albums",
          let: {
            petId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$pet_id", "$$petId"] }],
                },
              },
            },
          ],
          as: "pet_album",
        },
      },
      {
        $addFields: {
          is_user_liked: {
            $cond: {
              if: { $gt: [{ $size: "$pet_like" }, 0] },
              then: true,
              else: false,
            },
          },
          pet_media: {
            $cond: {
              if: { $gt: [{ $size: "$pet_album" }, 0] },
              then: {
                $cond: {
                  if: {
                    $eq: [
                      { $arrayElemAt: ["$pet_album.album_type", 0] },
                      "image",
                    ],
                  },
                  then: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$pet_album.album_path", 0] },
                    ],
                  },
                  else: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$pet_album.album_thumbnail", 0] },
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
          pet_name: 1,
          pet_type: 1,
          pet_breed: 1,
          location: 1,
          address: 1,
          gender: 1,
          price: 1,
          description: 1,
          is_adopted: 1,
          is_deleted: 1,
          is_user_liked: 1,
          pet_media: 1,
        },
      },
    ]);

    await multiSuccessRes(
      res,
      res.__("Pets list get successfully."),
      total_pets,
      pet_list,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const guestPetListing = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      search = "",
      pet_type,
      pet_breed,
      gender,
      page = 1,
      limit = 10,
      lat,
      long,
      miles_distance = 100,
      ln,
    } = req.body;
    i18n.setLocale(req, ln);

    console.log("req.body", req.body);

    const escapedSearch = search ? await escapeRegex(search) : null;

    const query: Record<string, unknown> = {
      is_deleted: false,
      is_adopted: false,
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

    let petType = [];
    let petBreed = [];
    let petGender = [];

    if (pet_type) {
      petType = JSON.parse(pet_type);
      query.pet_type = { $in: petType };
    }

    if (pet_breed) {
      petBreed = JSON.parse(pet_breed);
      query.pet_breed = { $in: petBreed };
    }

    if (gender) {
      petGender = JSON.parse(gender);
      query.gender = { $in: petGender };
    }

    if (escapedSearch) {
      query.$or = [
        { pet_name: { $regex: escapedSearch, $options: "i" } },
        { pet_type: { $regex: escapedSearch, $options: "i" } },
        { pet_breed: { $regex: escapedSearch, $options: "i" } },
        { gender: { $regex: escapedSearch, $options: "i" } },
        // { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const total_pets = await pets.countDocuments(query);

    const pet_list = await pets.aggregate([
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
          from: "pet_albums",
          let: {
            petId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$pet_id", "$$petId"] }],
                },
              },
            },
          ],
          as: "pet_album",
        },
      },
      {
        $addFields: {
          is_user_liked: false,
          pet_media: {
            $cond: {
              if: { $gt: [{ $size: "$pet_album" }, 0] },
              then: {
                $cond: {
                  if: {
                    $eq: [
                      { $arrayElemAt: ["$pet_album.album_type", 0] },
                      "image",
                    ],
                  },
                  then: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$pet_album.album_path", 0] },
                    ],
                  },
                  else: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$pet_album.album_thumbnail", 0] },
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
          pet_name: 1,
          pet_type: 1,
          pet_breed: 1,
          location: 1,
          address: 1,
          gender: 1,
          price: 1,
          description: 1,
          is_adopted: 1,
          is_deleted: 1,
          is_user_liked: 1,
          pet_media: 1,
        },
      },
    ]);

    await multiSuccessRes(
      res,
      res.__("Pets list get successfully."),
      total_pets,
      pet_list,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const petFavoriteList = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { page = 1, limit = 10, ln } = req.body;
    i18n.setLocale(req, ln);

    const total_pets = await pet_likes.countDocuments({
      user_id: user_id,
    });

    const pet_list = await pet_likes.aggregate([
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
          from: "pets",
          let: { localId: "$pet_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$_id", "$$localId"] }],
                },
              },
            },
          ],
          as: "pet_detail",
        },
      },
      {
        $unwind: {
          path: "$pet_detail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "pet_albums",
          let: {
            petId: "$pet_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$pet_id", "$$petId"] }],
                },
              },
            },
          ],
          as: "pet_album",
        },
      },
      {
        $addFields: {
          is_user_liked: true,
          pet_media: {
            $cond: {
              if: { $gt: [{ $size: "$pet_album" }, 0] },
              then: {
                $cond: {
                  if: {
                    $eq: [
                      { $arrayElemAt: ["$pet_album.album_type", 0] },
                      "image",
                    ],
                  },
                  then: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$pet_album.album_path", 0] },
                    ],
                  },
                  else: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$pet_album.album_thumbnail", 0] },
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
          _id: "$pet_detail._id",
          user_id: "$pet_detail.user_id",
          pet_name: "$pet_detail.pet_name",
          pet_type: "$pet_detail.pet_type",
          pet_breed: "$pet_detail.pet_breed",
          location: "$pet_detail.location",
          address: "$pet_detail.address",
          gender: "$pet_detail.gender",
          price: "$pet_detail.price",
          description: "$pet_detail.description",
          is_adopted: "$pet_detail.is_adopted",
          is_deleted: "$pet_detail.is_deleted",
          is_user_liked: 1,
          pet_media: 1,
        },
      },
    ]);

    await multiSuccessRes(
      res,
      res.__("Pet favorites list get successfully."),
      total_pets,
      pet_list,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const userPetListing = async (
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

    const total_pets = await pets.countDocuments(query);

    const pet_list = await pets.aggregate([
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
          from: "pet_likes",
          let: { localId: "$_id", userId: user_id },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$user_id", "$$userId"] },
                    { $eq: ["$pet_id", "$$localId"] },
                  ],
                },
              },
            },
          ],
          as: "pet_like",
        },
      },
      {
        $lookup: {
          from: "pet_albums",
          let: {
            petId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$pet_id", "$$petId"] }],
                },
              },
            },
          ],
          as: "pet_album",
        },
      },
      {
        $addFields: {
          is_user_liked: {
            $cond: {
              if: { $gt: [{ $size: "$pet_like" }, 0] },
              then: true,
              else: false,
            },
          },
          // pet_media: {
          //     $cond: {
          //         if: { $gt: [{ $size: "$pet_album" }, 0] },
          //         then: { $concat: [process.env.BUCKET_URL, { $arrayElemAt: ["$pet_album.album_path", 0] }] },
          //         else: null
          //     }
          // },
          pet_media: {
            $cond: {
              if: { $gt: [{ $size: "$pet_album" }, 0] },
              then: {
                $cond: {
                  if: {
                    $eq: [
                      { $arrayElemAt: ["$pet_album.album_type", 0] },
                      "image",
                    ],
                  },
                  then: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$pet_album.album_path", 0] },
                    ],
                  },
                  else: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$pet_album.album_thumbnail", 0] },
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
          pet_name: 1,
          pet_type: 1,
          pet_breed: 1,
          location: 1,
          address: 1,
          gender: 1,
          price: 1,
          description: 1,
          is_adopted: 1,
          is_deleted: 1,
          is_user_liked: 1,
          pet_media: 1,
        },
      },
    ]);

    await multiSuccessRes(
      res,
      res.__("Pets list get successfully."),
      total_pets,
      pet_list,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const guestUserPetListing = async (
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

    const total_pets = await pets.countDocuments(query);

    const pet_list = await pets.aggregate([
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
          from: "pet_albums",
          let: {
            petId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$pet_id", "$$petId"] }],
                },
              },
            },
          ],
          as: "pet_album",
        },
      },
      {
        $addFields: {
          is_user_liked: false,
          pet_media: {
            $cond: {
              if: { $gt: [{ $size: "$pet_album" }, 0] },
              then: {
                $cond: {
                  if: {
                    $eq: [
                      { $arrayElemAt: ["$pet_album.album_type", 0] },
                      "image",
                    ],
                  },
                  then: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$pet_album.album_path", 0] },
                    ],
                  },
                  else: {
                    $concat: [
                      process.env.BUCKET_URL,
                      { $arrayElemAt: ["$pet_album.album_thumbnail", 0] },
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
          pet_name: 1,
          pet_type: 1,
          pet_breed: 1,
          location: 1,
          address: 1,
          gender: 1,
          price: 1,
          description: 1,
          is_adopted: 1,
          is_deleted: 1,
          is_user_liked: 1,
          pet_media: 1,
        },
      },
    ]);

    await multiSuccessRes(
      res,
      res.__("Pets list get successfully."),
      total_pets,
      pet_list,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

import i18n from "i18n";
import { Request, Response } from "express";

import { pets } from "./../../../model/model.pets";
import { pet_likes } from "./../../../model/model.pet_likes";

import {
  errorRes,
  multiSuccessRes,
  successRes,
} from "./../../../../util/response_functions";

import {
  findPet,
  escapeRegex,
  objectId,
} from "./../../../../util/user_function";

export const allPetList = async (
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
              [
                [minLong, minLat],
                [maxLong, minLat],
                [maxLong, maxLat],
                [minLong, maxLat],
                [minLong, minLat], // closed polygon
              ],
            ],
          },
        },
      };
    }

    let petType: string[] = [];
    let petBreed: string[] = [];
    let petGender: string[] = [];

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
        { description: { $regex: escapedSearch, $options: "i" } },
      ];
    }

    const total_pets = await pets.countDocuments(query);

    const pet_list = await pets.aggregate([
      { $match: query },
      { $sort: { createdAt: -1 } },
      { $skip: (parseInt(page) - 1) * parseInt(limit) },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: "pet_albums",
          let: { petId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$pet_id", "$$petId"] },
              },
            },
          ],
          as: "pet_album",
        },
      },
      {
        $addFields: {
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
  } catch (error) {
    console.error("Error:", error);
    await errorRes(res, res.__("Internal server error"));
  }
};

export const petDetail = async (req: Request, res: Response): Promise<void> => {
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

export const petFavoritesUsers = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { pet_id, page = 1, limit = 10, ln } = req.body;
    i18n.setLocale(req, ln);

    const petObjectId = await objectId(pet_id);

    const total_users = await pet_likes.countDocuments({
      pet_id: petObjectId,
    });

    const user_list = await pet_likes.aggregate([
      {
        $match: {
          pet_id: petObjectId,
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
        },
      },
      {
        $project: {
          _id: 1,
          user_id: "$user_details.user_id",
          full_name: "$user_details.full_name",
          user_profile: 1,
        },
      },
    ]);

    await multiSuccessRes(
      res,
      res.__("Pet favorites user list get successfully."),
      total_users,
      user_list,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

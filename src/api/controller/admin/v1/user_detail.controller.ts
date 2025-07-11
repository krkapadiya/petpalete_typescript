import i18n from "i18n";
import { Request, Response } from "express";

import { users } from "./../../../model/model.users";
import { pets } from "./../../../model/model.pets";
import { services } from "./../../../model/model.services";
import { pet_likes } from "./../../../model/model.pet_likes";
import { service_likes } from "./../../../model/model.service_likes";
import { communities } from "./../../../model/model.communities";
import { user_reviews } from "./../../../model/model.user_reviews";
import { payments } from "./../../../model/model.payments";

import {
  errorRes,
  countMultiSuccessRes,
  multiSuccessRes,
  successRes,
} from "./../../../../util/response_functions";

import {
  findBlockUser,
  findUser,
  escapeRegex,
  objectId,
} from "./../../../../util/user_function";

export const allUserList = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    let { search = "", page = 1, limit = 10, ln } = req.body;
    i18n.setLocale(req, ln);

    const escapedSearch = search ? await escapeRegex(search) : null;

    const users_data = await users.aggregate([
      {
        $match: {
          user_type: "user",
          is_deleted: false,
        },
      },
      {
        $addFields: {
          mobile_no: { $toString: "$mobile_number" },
        },
      },
      {
        $match: escapedSearch
          ? {
              $or: [
                { full_name: { $regex: escapedSearch, $options: "i" } },
                { email_address: { $regex: escapedSearch, $options: "i" } },
                { mobile_no: { $regex: escapedSearch, $options: "i" } },
                { address: { $regex: escapedSearch, $options: "i" } },
              ],
            }
          : {},
      },
      {
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: (parseInt(page) - 1) * parseInt(limit),
      },
      {
        $limit: parseInt(limit),
      },
      {
        $lookup: {
          from: "user_albums",
          let: { localId: "$_id" },
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
          user_type: 1,
          full_name: 1,
          email_address: 1,
          mobile_number: 1,
          country_code: 1,
          country_string_code: 1,
          is_social_login: 1,
          social_id: 1,
          social_platform: 1,
          notification_badge: 1,
          user_profile: 1,
          location: 1,
          address: {
            $cond: {
              if: {
                $ne: [
                  {
                    $type: "$address",
                  },
                  "missing",
                ],
              },
              then: "$address",
              else: null,
            },
          },
          is_user_verified: 1,
          is_blocked_by_admin: 1,
          is_deleted: 1,
        },
      },
    ]);

    const users_data_count = await users.aggregate([
      {
        $match: {
          user_type: "user",
          is_deleted: false,
        },
      },
      {
        $addFields: {
          mobile_no: { $toString: "$mobile_number" },
        },
      },
      {
        $match: escapedSearch
          ? {
              $or: [
                { full_name: { $regex: escapedSearch, $options: "i" } },
                { email_address: { $regex: escapedSearch, $options: "i" } },
                { mobile_no: { $regex: escapedSearch, $options: "i" } },
                { address: { $regex: escapedSearch, $options: "i" } },
              ],
            }
          : {},
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]);

    await multiSuccessRes(
      res,
      res.__("User list retrieved successfully."),
      users_data_count.length,
      users_data,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const userDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    let { user_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const userObjectId = await objectId(user_id);

    const [find_user_data] = await users.aggregate([
      {
        $match: {
          _id: userObjectId,
          is_deleted: false,
        },
      },
      {
        $lookup: {
          from: "user_albums",
          let: { localId: "$_id" },
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
          user_type: 1,
          full_name: 1,
          email_address: 1,
          mobile_number: 1,
          country_code: 1,
          country_string_code: 1,
          is_social_login: 1,
          social_id: 1,
          social_platform: 1,
          notification_badge: 1,
          user_profile: 1,
          location: 1,
          address: {
            $cond: {
              if: {
                $ne: [
                  {
                    $type: "$address",
                  },
                  "missing",
                ],
              },
              then: "$address",
              else: null,
            },
          },
          is_user_verified: 1,
          is_blocked_by_admin: 1,
          is_deleted: 1,
        },
      },
    ]);

    await successRes(
      res,
      res.__("User details retrieved successfully."),
      find_user_data,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const blockUnblockUser = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { block_user_id, is_block, ln } = req.body;
    i18n.setLocale(req, ln);

    let find_user = await findUser(block_user_id);

    if (!find_user) {
      await errorRes(res, res.__("User not found."));
      return;
    }

    if (is_block == true || is_block == "true") {
      let find_block = await findBlockUser(block_user_id);

      if (find_block) {
        await successRes(res, "User has been successfully blocked.", []);
        return;
      }

      await users.updateOne(
        {
          _id: block_user_id,
        },
        {
          $set: {
            is_blocked_by_admin: true,
          },
        },
      );

      await successRes(res, res.__("User has been successfully blocked."), []);
      return;
    }

    await users.updateOne(
      {
        _id: block_user_id,
      },
      {
        $set: {
          is_blocked_by_admin: false,
        },
      },
    );

    await successRes(res, res.__("User has been successfully unblocked."), []);
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const userPets = async (req: Request, res: Response): Promise<void> => {
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
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const userPetFavorites = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { user_id, page = 1, limit = 10, ln } = req.body;
    i18n.setLocale(req, ln);

    const userObjectId = await objectId(user_id);

    const total_pets = await pet_likes.countDocuments({
      user_id: userObjectId,
    });

    const pet_list = await pet_likes.aggregate([
      {
        $match: {
          user_id: userObjectId,
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

export const userServices = async (
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

export const userServiceFavorites = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { user_id, page = 1, limit = 10, ln } = req.body;
    i18n.setLocale(req, ln);

    const userObjectId = await objectId(user_id);

    const total_services = await service_likes.countDocuments({
      user_id: userObjectId,
    });

    const service_list = await service_likes.aggregate([
      {
        $match: {
          user_id: userObjectId,
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

export const userCommunities = async (
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

export const userReviews = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { reviewed_user_id, page = 1, limit = 10, ln } = req.body;
    i18n.setLocale(req, ln);

    const reviewObjectId = await objectId(reviewed_user_id);

    const result = await user_reviews.aggregate([
      {
        $match: { reviewed_user_id: reviewObjectId },
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
        $sort: {
          createdAt: -1,
        },
      },
      {
        $skip: (parseInt(page) - 1) * parseInt(limit),
      },
      {
        $limit: parseInt(limit),
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
          user_id: 1,
          user_profile: 1,
          full_name: "$user_details.full_name",
          rating: {
            $toString: {
              $round: [{ $ifNull: ["$rating", 0] }, 1],
            },
          },
          review: 1,
          createdAt: 1,
          updatedAt: 1,
        },
      },
    ]);

    const result_count = await user_reviews.countDocuments({
      reviewed_user_id: reviewObjectId,
    });

    await multiSuccessRes(
      res,
      res.__("Reviews list fetched successfully"),
      result_count,
      result,
    );
    return;
  } catch (error) {
    console.log("Error: ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const paymentList = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { user_id, page = 1, limit = 10, ln } = req.body;
    i18n.setLocale(req, ln);

    const userObjectId = await objectId(user_id);

    const totalAmount = await payments.aggregate([
      {
        $match: {
          is_deleted: false,
          user_id: userObjectId,
        },
      },
      {
        $group: {
          _id: userObjectId,
          total_amount: { $sum: "$amount" },
        },
      },
      {
        $project: {
          _id: 0,
          total_amount: 1,
        },
      },
    ]);

    const payment_list = await payments.aggregate([
      {
        $match: {
          is_deleted: false,
          user_id: userObjectId,
        },
      },
      {
        $sort: {
          createdAt: -1,
        },
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
          as: "user_detail",
        },
      },
      {
        $unwind: {
          path: "$user_detail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "pets",
          localField: "pet_id",
          foreignField: "_id",
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
        $addFields: {
          pet_name: "$pet_detail.pet_name",
        },
      },
      {
        $project: {
          _id: 1,
          user_id: 1,
          pet_id: 1,
          payment_id: 1,
          transaction_id: 1,
          payment_method: 1,
          payment_status: 1,
          amount: 1,
          payment_date: 1,
          pet_name: 1,
          is_deleted: 1,
        },
      },
    ]);

    const payment_list_count = await payments.countDocuments({
      is_deleted: false,
      user_id: userObjectId,
    });

    await countMultiSuccessRes(
      res,
      res.__("Payment list get successfully."),
      payment_list_count,
      totalAmount[0]?.total_amount || 0,
      payment_list,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const allPayments = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      search = "",
      fromDate,
      toDate,
      page = 1,
      limit = 10,
      ln,
    } = req.body;
    i18n.setLocale(req, ln);

    let query: Record<string, any> = {};

    if (fromDate && toDate) {
      query.payment_date = {
        $gte: new Date(fromDate),
        $lte: new Date(toDate),
      };
    }

    const escapedSearch = search ? await escapeRegex(search) : null;

    const payment_list = await payments.aggregate([
      {
        $match: {
          is_deleted: false,
          ...query,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_detail",
        },
      },
      {
        $unwind: {
          path: "$user_detail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "pets",
          localField: "pet_id",
          foreignField: "_id",
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
        $match: escapedSearch
          ? {
              $or: [
                { transaction_id: { $regex: escapedSearch, $options: "i" } },
                {
                  "user_detail.full_name": {
                    $regex: escapedSearch,
                    $options: "i",
                  },
                },
                {
                  "pet_detail.pet_name": {
                    $regex: escapedSearch,
                    $options: "i",
                  },
                },
              ],
            }
          : {},
      },
      {
        $sort: {
          createdAt: -1,
        },
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
          pet_name: "$pet_detail.pet_name",
          full_name: "$user_detail.full_name",
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
          pet_id: 1,
          payment_id: 1,
          transaction_id: 1,
          payment_method: 1,
          payment_status: 1,
          amount: 1,
          payment_date: 1,
          pet_name: 1,
          full_name: 1,
          pet_media: 1,
          user_media: 1,
          is_deleted: 1,
        },
      },
    ]);

    const payment_list_count = await payments.aggregate([
      {
        $match: {
          is_deleted: false,
          ...query,
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "user_id",
          foreignField: "_id",
          as: "user_detail",
        },
      },
      {
        $unwind: {
          path: "$user_detail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "pets",
          localField: "pet_id",
          foreignField: "_id",
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
        $match: escapedSearch
          ? {
              $or: [
                { transaction_id: { $regex: escapedSearch, $options: "i" } },
                {
                  "user_detail.full_name": {
                    $regex: escapedSearch,
                    $options: "i",
                  },
                },
                {
                  "pet_detail.pet_name": {
                    $regex: escapedSearch,
                    $options: "i",
                  },
                },
              ],
            }
          : {},
      },
      {
        $project: {
          _id: 1,
        },
      },
    ]);

    await multiSuccessRes(
      res,
      res.__("Payment list get successfully."),
      payment_list_count.length,
      payment_list,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

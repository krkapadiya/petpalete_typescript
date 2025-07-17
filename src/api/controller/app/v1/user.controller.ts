import i18n from "i18n";
import Stripe from "stripe";
const stripe = new Stripe(process.env.SECRET_KEY as string);
import { Request, Response } from "express";
import { IUser } from "./../../../model/model.users";
import { MediaFile } from "./../../../../util/bucket_manager";

import { userToken } from "./../../../../util/token";

import { users } from "./../../../model/model.users";
import { services } from "./../../../model/model.services";
import { communities } from "./../../../model/model.communities";
import { pets } from "./../../../model/model.pets";
import { payments } from "./../../../model/model.payments";
import { faqs } from "./../../../model/model.faqs";
import { notifications } from "./../../../model/model.notifications";
import { report_users } from "./../../../model/model.report_users";
import { guests } from "./../../../model/model.guests";
import { user_sessions } from "./../../../model/model.user_sessions";
import { user_reviews } from "./../../../model/model.user_reviews";
import { user_albums } from "./../../../model/model.user_albums";
import { email_verifications } from "./../../../model/model.email_varifications";
import { pet_likes } from "./../../../model/model.pet_likes";
import { service_likes } from "./../../../model/model.service_likes";
// import { communities_albums } from "./../../../model/model.communities_albums";

import {
  errorRes,
  successRes,
  multiSuccessRes,
  countMultiSuccessRes,
} from "./../../../../util/response_functions";

import { sendOtpForgotPassword } from "./../../../../util/send_mail";

import { multiNotificationSend } from "./../../../../util/send_notifications";

import {
  findUserAlbum,
  findPet,
  findExistingPayment,
  incNotificationBadge,
  findExistingReport,
  findUserAlbumId,
  findSocialBlockUser,
  objectId,
  findReview,
  findOwnReview,
  findExistingReview,
  findGuestUser,
  findSocialEmailAddress,
  findEmailAddress,
  findMobileNumber,
  findUser,
  findVerifyEmailAddress,
  findAlbumById,
  findDeviceToken,
} from "./../../../../util/user_function";

import {
  securePassword,
  comparePassword,
} from "./../../../../util/secure_password";

import {
  uploadMediaIntoS3Bucket,
  removeMediaFromS3Bucket,
} from "./../../../../util/bucket_manager";
// import { string } from "joi";
// import { Types } from "mongoose";

interface UserRequestBody {
  device_token: string;
  device_type: string;
  location?: string | Record<string, unknown>;
  address: string;
  ln: string;
}

export interface signInRequest {
  email_address: string;
  full_name?: string;
  device_type: string;
  device_token: string;
  password?: string;
  is_social_login?: boolean | string;
  social_id?: string;
  social_platform?: string;
  location?: string;
  address?: string;
  ln: string;
}

export const guestSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { device_token, device_type, location, address, ln } =
      req.body as UserRequestBody;
    i18n.setLocale(req, ln);

    const find_guest_user = await findGuestUser(device_token);

    if (find_guest_user) {
      await guests.deleteMany({ device_token });
    }

    const insert_data: Record<string, unknown> = {
      device_token,
      device_type,
      address,
    };
    if (location) {
      let parsed: Record<string, unknown> | null = null;

      if (typeof location === "string") {
        try {
          parsed = JSON.parse(location);
        } catch (err) {
          console.log("Error : ", err as Error);
          console.warn("guestSession: invalid JSON in `location`:", location);
        }
      } else {
        parsed = location;
      }

      if (parsed) {
        insert_data.location = parsed;
      }
    }
    await guests.create(insert_data);

    await successRes(res, res.__("Guest added successfully."), {});
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
  }
};

export const checkEmailAddress = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email_address, ln } = req.body;
    i18n.setLocale(req, ln);

    const check_email_address = await findEmailAddress(email_address);

    if (check_email_address) {
      await errorRes(res, res.__("Email address already exists."));
      return;
    }

    await successRes(res, res.__("Email address available."), {});
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const checkMobileNumber = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { mobile_number, ln } = req.body;
    i18n.setLocale(req, ln);

    const check_mobile_number = await findMobileNumber(mobile_number);

    if (check_mobile_number) {
      await errorRes(res, res.__("Mobile number already exists."));
      return;
    }

    await successRes(res, res.__("Mobile number available."), {});
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const signUp = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      full_name,
      email_address,
      country_code,
      country_string_code,
      mobile_number,
      is_social_login,
      social_id,
      social_platform,
      device_token,
      device_type,
      password,
      location,
      address,
      ln,
    } = req.body;

    i18n.setLocale(req, ln);

    const insert_data: Partial<IUser> | Record<string, unknown> = {
      full_name,
      email_address,
      country_code,
      country_string_code,
      mobile_number,
      address,
    };
    if (is_social_login === true || is_social_login === "true") {
      insert_data.is_social_login = is_social_login;
      insert_data.social_id = social_id;
      insert_data.social_platform = social_platform;
    }

    if (password) {
      const hashedPassword = await securePassword(password);
      insert_data.password = hashedPassword;
    }

    if (location) {
      const parsedLocation = JSON.parse(location);
      const latitude = parseFloat(parsedLocation.latitude);
      const longitude = parseFloat(parsedLocation.longitude);

      if (!isNaN(latitude) && !isNaN(longitude)) {
        insert_data.location = {
          type: "Point",
          coordinates: [longitude, latitude],
        };
      } else {
        console.warn("Invalid location data:", parsedLocation);
      }
    }

    await email_verifications.create({
      email_address: email_address,
      is_email_verified: true,
    });

    const customer = await stripe.customers.create({
      name: full_name,
      email: email_address,
    });

    if (customer) {
      insert_data.customer_id = customer.id;
    }

    const userDoc = await users.create(insert_data);
    const token = await userToken(userDoc);

    const session = await user_sessions.create({
      user_id: userDoc._id.toString(),
      user_type: "user",
      device_token: device_token,
      auth_token: token,
      device_type: device_type,
      is_login: true,
      is_active: true,
    });

    await guests.deleteMany({
      device_token: device_token,
      device_type: device_type,
    });

    const res_data = {
      ...userDoc.toObject(),
      token: token,
      device_token: session.device_token,
      device_type: session.device_type,
      user_profile: null as null,
    };
    await successRes(res, res.__("User signup successfully."), res_data);
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const signIn = async (
  req: Request<object, object, signInRequest>,
  res: Response,
): Promise<void> => {
  try {
    const {
      email_address,
      full_name,
      device_type,
      device_token,
      password,
      is_social_login,
      social_id,
      social_platform,
      location,
      address,
      ln,
    } = req.body as signInRequest;

    i18n.setLocale(req, ln);

    const isSocial = is_social_login === true || is_social_login === "true";

    if (isSocial) {
      let find_user: IUser | null = null;

      if (email_address) {
        const found = await findSocialEmailAddress(email_address);
        if (found && "_id" in found) {
          find_user = found as IUser;
        }
      } else if (social_id) {
        const result = await users.find({
          is_social_login: true,
          social_id,
          is_deleted: false,
        });
        if (result.length > 0) {
          find_user = result[0] as IUser;
        }
      }

      if (find_user) {
        if (
          find_user.social_platform &&
          find_user.social_platform !== social_platform
        ) {
          await errorRes(
            res,
            res.__("auth.email_already_used", {
              platform: String(find_user.social_platform ?? ""),
            } as Record<string, string>),
          );
          return;
        }

        if (find_user.is_blocked_by_admin === true) {
          await errorRes(
            res,
            res.__(
              "This account has been blocked. Please get in touch with the administrator.",
            ),
          );
          return;
        }

        const token = await userToken(find_user);

        const session = await user_sessions.create({
          user_id: find_user._id,
          user_type: "user",
          device_token,
          auth_token: token,
          device_type,
          is_login: true,
          is_active: true,
        });

        await guests.deleteMany({ device_token, device_type });

        const res_data = {
          ...find_user.toObject(),
          token,
          device_token: session.device_token,
          device_type: session.device_type,
          user_profile: null,
        };
        await successRes(res, res.__("User signin successfully."), res_data);
        return;
      } else {
        const blockedUser = await findSocialBlockUser(email_address);
        if (blockedUser) {
          await errorRes(
            res,
            res.__(
              "This account has been blocked. Please get in touch with the administrator.",
            ),
          );
          return;
        }

        const insert_data: Record<string, unknown> = {
          email_address,
          full_name,
          is_social_login: true,
          social_id,
          social_platform,
          address,
        };
        if (location) {
          try {
            insert_data.location = JSON.parse(location);
          } catch {
            insert_data.location = {};
          }
        }

        await email_verifications.create({
          email_address,
          is_email_verified: true,
        });

        const customer = await stripe.customers.create({
          name: full_name,
          email: email_address,
        });

        if (customer) {
          insert_data.customer_id = customer.id;
        }

        const create_user = await users.create(insert_data);

        const token = await userToken(create_user);

        const session = await user_sessions.create({
          user_id: create_user._id,
          user_type: "user",
          device_token,
          auth_token: token,
          device_type,
          is_login: true,
          is_active: true,
        });

        await guests.deleteMany({ device_token, device_type });

        const res_data = {
          ...create_user.toObject(),
          token,
          device_token: session.device_token,
          device_type: session.device_type,
          user_profile: null as null,
        };
        await successRes(res, res.__("User signin successfully."), res_data);
        return;
      }
    } else {
      const find_user = await findEmailAddress(email_address);
      if (!find_user || !("_id" in find_user)) {
        await errorRes(
          res,
          res.__("No account was found with this email address."),
        );
        return;
      }

      if (find_user.is_social_login === true) {
        await errorRes(
          res,
          res.__(
            "auth.email_already_used",
            String(find_user.social_platform ?? ""),
          ),
        );
        return;
      }

      if (typeof find_user.password !== "string") {
        await errorRes(res, res.__("Password not set for this user."));
        return;
      }
      const password_verify = await comparePassword(
        password || "",
        find_user.password,
      );
      if (!password_verify) {
        await errorRes(res, res.__("Incorrect password. Please try again."));
        return;
      }

      if (find_user.is_blocked_by_admin === true) {
        await errorRes(
          res,
          res.__(
            "This account has been blocked. Please get in touch with the administrator.",
          ),
        );
        return;
      }

      const token = await userToken(find_user);

      await user_sessions.create({
        user_id: find_user._id,
        user_type: find_user.user_type,
        device_token,
        auth_token: token,
        device_type,
        is_login: true,
      });

      await guests.deleteMany({ device_token, device_type });

      const user_album = await findUserAlbum(find_user._id.toString());

      const res_data = {
        ...find_user.toObject(),
        token,
        user_profile: user_album
          ? `${process.env.BUCKET_URL}${user_album}`
          : null,
      };
      await successRes(res, res.__("Successfully logged in."), res_data);
      return;
    }
  } catch (error) {
    console.error("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const changePassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.user || !req.user._id) {
      await errorRes(res, "User not authenticated");
      return;
    }
    const user_id = req.user._id;
    const { old_password, new_password, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_user = await findUser(user_id);
    if (!find_user || typeof find_user !== "object" || !("_id" in find_user)) {
      await errorRes(res, res.__("User not found."));
      return;
    }

    if (find_user.is_social_login === true) {
      await errorRes(
        res,
        res.__("auth.change_password", {
          platform: find_user.social_platform as string,
        }),
      );
      return;
    }

    const password_verify = await comparePassword(
      old_password,
      find_user.password as string,
    );

    if (!password_verify) {
      await errorRes(
        res,
        res.__("The old password is incorrect. Please try again."),
      );
      return;
    }

    const hashedPassword = await securePassword(new_password);

    if (find_user.password === hashedPassword) {
      await errorRes(
        res,
        res.__(
          "Your existing and new password are similar. Please try a different password.",
        ),
      );
      return;
    }

    const update_data = {
      password: hashedPassword,
    };
    await users.findByIdAndUpdate(user_id, update_data);

    await successRes(res, res.__("Your password has been changed."), []);
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email_address, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_user = await findEmailAddress(email_address);

    if (!find_user) {
      await errorRes(res, res.__("No account found with this email."));
      return;
    }

    if (find_user.is_social_login === true) {
      await errorRes(
        res,
        res.__("auth.forgot_password", {
          platform: String(find_user.social_platform ?? ""),
        }),
      );
      return;
    }

    const otp = Math.floor(1000 + Math.random() * 9000);

    await email_verifications.updateOne(
      {
        email_address: email_address,
        is_email_verified: true,
        is_deleted: false,
      },
      {
        $set: {
          otp: otp,
        },
      },
    );

    const emailData = {
      full_name: find_user.full_name,
      emailAddress: find_user.email_address,
      otp: otp.toString(),
    };
    await sendOtpForgotPassword(emailData);

    await successRes(res, res.__("Otp sent successfully to your email."), otp);
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const verifyOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email_address, otp, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_user = await findVerifyEmailAddress(email_address);

    if (!find_user) {
      await errorRes(
        res,
        res.__("No account was found with this email address."),
      );
      return;
    }

    if (
      find_user &&
      typeof find_user === "object" &&
      "otp" in find_user &&
      typeof find_user.otp === "number" &&
      find_user.otp === parseInt(otp.toString())
    ) {
      const update_data = {
        otp: null as null,
      };
      await email_verifications.updateOne(
        {
          email_address: email_address,
          is_email_verified: true,
          is_deleted: false,
        },
        {
          $set: update_data,
        },
      );

      await successRes(res, res.__("Code verified successfully."), []);
      return;
    } else {
      await errorRes(res, res.__("Please enter valid Code."));
      return;
    }
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email_address, mobile_number, new_password, ln } = req.body;
    i18n.setLocale(req, ln);

    if (email_address) {
      const find_user = await findEmailAddress(email_address);

      if (!find_user) {
        await errorRes(
          res,
          res.__("No account was found with this email address."),
        );
        return;
      }

      const hashedPassword = await securePassword(new_password);

      const update_data = {
        password: hashedPassword,
      };
      await users.updateOne(
        {
          _id: find_user._id,
        },
        {
          $set: update_data,
        },
      );

      await successRes(
        res,
        res.__(`Your password has been updated successfully.`),
        [],
      );
      return;
    }

    if (mobile_number) {
      const find_user = await findMobileNumber(mobile_number);

      if (!find_user) {
        await errorRes(
          res,
          res.__("No account was found with this mobile number."),
        );
        return;
      }

      const hashedPassword = await securePassword(new_password);

      const update_data = {
        password: hashedPassword,
      };
      if (
        !find_user ||
        typeof find_user !== "object" ||
        !("_id" in find_user)
      ) {
        await errorRes(res, res.__("User not found."));
        return;
      }
      await users.updateOne(
        { _id: find_user._id.toString() },
        { $set: update_data },
      );

      await successRes(
        res,
        res.__(`Your password has been updated successfully.`),
        [],
      );
      return;
    }
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { device_token, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_user = await findUser(user_id);

    if (!find_user) {
      await errorRes(res, res.__("User not found."));
      return;
    }

    await user_sessions.deleteMany({
      user_id: user_id,
      device_token: device_token,
    });

    await successRes(res, res.__("You have successfully logged out."), []);
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const deleteAccount = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { device_token, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_user = await findUser(user_id);

    if (!find_user) {
      await errorRes(res, res.__("User not found."));
      return;
    }

    await users.updateOne(
      { _id: user_id },
      {
        $set: {
          is_deleted: true,
        },
      },
      { new: true },
    );

    // for remove pet likes by the other users

    pets.find({ user_id: user_id }).then(async (data) => {
      if (data.length > 0) {
        for (const pet of data) {
          await pet_likes.deleteMany({ pet_id: pet._id });
        }
      }
    });

    // for remove services like by the other users

    services.find({ user_id: user_id }).then(async (data) => {
      if (data.length > 0) {
        for (const service of data) {
          await service_likes.deleteMany({ service_id: service._id });
        }
      }
    });

    await user_sessions.deleteMany({
      user_id: user_id,
      device_token: device_token,
    });
    await user_reviews.deleteMany({ user_id: user_id });
    await user_albums.deleteMany({ user_id: user_id });
    await services.deleteMany({ user_id: user_id });
    await pets.deleteMany({ user_id: user_id });
    await communities.deleteMany({ user_id: user_id });
    await payments.deleteMany({ user_id: user_id });
    await notifications.deleteMany({ sender_id: user_id });

    await successRes(res, res.__("Your account is deleted successfully."), []);
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const uploadMedia = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: Request & { user: { _id: string }; files?: any },
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { album_type, ln } = req.body as { album_type: string; ln: string };

    i18n.setLocale(req, ln);
    if (!req.files || !req.files.album) {
      console.log("album missing → returning 400");
      errorRes(res, res.__("Album file is required."));
      return;
    }

    if (!req.files || !req.files.album) {
      errorRes(res, res.__("Album file is required."));
      return;
    }
    const albumSrc = Array.isArray(req.files.album)
      ? req.files.album[0]
      : req.files.album;
    const thumbSrc = req.files.thumbnail
      ? Array.isArray(req.files.thumbnail)
        ? req.files.thumbnail[0]
        : req.files.thumbnail
      : undefined;

    const folder_name = "user_media";
    const content_type = albumSrc.type;

    const mediaAlbum: MediaFile = {
      originalFilename: albumSrc.originalFilename,
      path: albumSrc.path,
      mimetype: albumSrc.type,
      data: Buffer.alloc(0),
    };

    const res_upload_file = await uploadMediaIntoS3Bucket(
      mediaAlbum,
      folder_name,
      content_type,
    );

    if (!res_upload_file.status) {
      errorRes(res, res.__("User media upload failed."));
      return;
    }

    if (thumbSrc) {
      const folder_name_thumbnail = "video_thumbnail";
      const content_type_thumbnail = thumbSrc.type;

      const mediaThumbnail: MediaFile = {
        originalFilename: thumbSrc.originalFilename,
        path: thumbSrc.path,
        mimetype: thumbSrc.type,
        data: Buffer.alloc(0),
      };

      const res_upload_thumbnail_file = await uploadMediaIntoS3Bucket(
        mediaThumbnail,
        folder_name_thumbnail,
        content_type_thumbnail,
      );

      if (!res_upload_thumbnail_file.status) {
        errorRes(res, res.__("User thumbnail media upload failed."));
        return;
      }

      const user_image_path = `${folder_name}/` + res_upload_file.file_name;
      const thumbnail_image_path =
        `${folder_name_thumbnail}/` + res_upload_thumbnail_file.file_name;

      const add_albums = await user_albums.create({
        user_id,
        album_type,
        album_thumbnail: thumbnail_image_path,
        album_path: user_image_path,
      });

      add_albums.album_path = process.env.BUCKET_URL + add_albums.album_path;
      add_albums.album_thumbnail =
        process.env.BUCKET_URL + add_albums.album_thumbnail;

      successRes(res, res.__("User media uploaded successfully."), add_albums);
      return;
    }

    const user_image_path = `${folder_name}/` + res_upload_file.file_name;

    const add_albums = await user_albums.create({
      user_id,
      album_type,
      album_thumbnail: null,
      album_path: user_image_path,
    });

    add_albums.album_path = process.env.BUCKET_URL + add_albums.album_path;

    successRes(res, res.__("User media uploaded successfully."), add_albums);
  } catch (error) {
    console.error("Error :", error);
    errorRes(res, res.__("Internal server error"));
  }
};

export const removeMedia = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { album_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const userAlbum = await findAlbumById(album_id, user_id);

    if (
      userAlbum &&
      typeof userAlbum === "object" &&
      "album_path" in userAlbum
    ) {
      const res_remove_file = await removeMediaFromS3Bucket(
        userAlbum.album_path as string,
      );
      if (userAlbum.album_type === "video") {
        await removeMediaFromS3Bucket(userAlbum.album_thumbnail as string);
      }

      if (res_remove_file.status) {
        await user_albums.deleteOne({
          _id: album_id,
        });

        await successRes(res, res.__("Media removed successfully."), []);
        return;
      } else {
        await errorRes(res, res.__("Failed to remove user media."));
        return;
      }
    } else {
      await errorRes(res, res.__("Album not found."));
      return;
    }
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const deleteAllNotifications = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;

    await notifications.updateMany(
      {
        $or: [{ receiver_id: user_id }, { receiver_ids: { $in: [user_id] } }],
        is_deleted: false,
      },
      { $addToSet: { deleted_by_user: user_id } },
    );

    await successRes(res, "All notifications deleted successfully", []);
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const notificationsList = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    let user_id;

    if (req.user._id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    const { page = 1, limit = 10, ln } = req.body;
    i18n.setLocale(req, ln);

    const userObjectId = await objectId(user_id);

    const notification_list = await notifications.aggregate([
      {
        $match: {
          is_deleted: false,
          deleted_by_user: { $ne: userObjectId },
          $or: [
            { receiver_id: userObjectId },
            { receiver_ids: { $in: [userObjectId] } },
          ],
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
          localField: "sender_id",
          foreignField: "_id",
          as: "sender_detail",
        },
      },
      {
        $unwind: {
          path: "$sender_detail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "user_albums",
          localField: "sender_id",
          foreignField: "user_id",
          as: "sender_album",
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
        $lookup: {
          from: "pet_albums",
          let: { petId: "$pet_detail._id", userId: "$pet_detail.user_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$pet_id", "$$petId"] },
                    { $eq: ["$user_id", "$$userId"] },
                  ],
                },
              },
            },
          ],
          as: "pet_album",
        },
      },
      {
        $lookup: {
          from: "services",
          localField: "service_id",
          foreignField: "_id",
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
            serviceId: "$service_detail._id",
            userId: "$service_detail.user_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    { $eq: ["$service_id", "$$serviceId"] },
                    { $eq: ["$user_id", "$$userId"] },
                  ],
                },
              },
            },
          ],
          as: "service_album",
        },
      },
      {
        $lookup: {
          from: "chats",
          localField: "chat_id",
          foreignField: "_id",
          as: "chat_detail",
        },
      },
      {
        $unwind: {
          path: "$chat_detail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $lookup: {
          from: "user_reviews",
          localField: "review_id",
          foreignField: "_id",
          as: "user_review_detail",
        },
      },
      {
        $unwind: {
          path: "$user_review_detail",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          sender_profile: {
            $cond: {
              if: { $gt: [{ $size: "$sender_album" }, 0] },
              then: {
                $concat: [
                  process.env.BUCKET_URL,
                  { $arrayElemAt: ["$sender_album.album_path", 0] },
                ],
              },
              else: null,
            },
          },
          pet_profile: {
            $cond: {
              if: { $gt: [{ $size: "$pet_album" }, 0] },
              // then: { $concat: [process.env.BUCKET_URL, { $arrayElemAt: ["$pet_album.album_path", 0] }] },
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
          service_profile: {
            $cond: {
              if: { $gt: [{ $size: "$service_album" }, 0] },
              // then: { $concat: [process.env.BUCKET_URL, { $arrayElemAt: ["$service_album.album_path", 0] }] },
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
          pet_name: {
            $cond: {
              if: {
                $or: [
                  { $eq: ["$noti_for", "new_pet"] },
                  { $eq: ["$noti_for", "pet_published"] },
                ],
              },
              then: "$pet_detail.pet_name",
              else: null,
            },
          },
          service_name: {
            $cond: {
              if: {
                $or: [{ $eq: ["$noti_for", "new_service"] }],
              },
              then: "$service_detail.service_name",
              else: null,
            },
          },
          full_name: "$sender_detail.full_name",
          message: {
            $cond: {
              if: { $eq: ["$noti_for", "chat_notification"] },
              then: "$chat_detail.message",
              else: null,
            },
          },
          rating: {
            $cond: {
              if: { $eq: ["$noti_for", "new_review"] },
              then: "$user_review_detail.rating",
              else: null,
            },
          },
          review: {
            $cond: {
              if: { $eq: ["$noti_for", "new_review"] },
              then: "$user_review_detail.review",
              else: null,
            },
          },
        },
      },
      {
        $project: {
          _id: 1,
          sender_id: 1,
          receiver_id: 1,
          // receiver_ids: 1,
          noti_title: 1,
          noti_msg: 1,
          noti_for: 1,
          noti_date: 1,
          chat_room_id: 1,
          chat_id: 1,
          review_id: 1,
          pet_id: 1,
          service_id: 1,
          community_id: 1,
          // deleted_by_user: 1,
          is_deleted: 1,
          sender_profile: 1,
          pet_profile: 1,
          service_profile: 1,
          pet_name: 1,
          service_name: 1,
          full_name: 1,
          message: 1,
          rating: 1,
          review: 1,
        },
      },
    ]);

    const notification_list_count = await notifications.countDocuments({
      is_deleted: false,
      deleted_by_user: { $ne: userObjectId },
      $or: [
        { receiver_id: userObjectId },
        { receiver_ids: { $in: [userObjectId] } },
      ],
    });

    await users.updateOne(
      {
        _id: userObjectId,
      },
      {
        $set: {
          notification_badge: 0,
        },
      },
    );

    await multiSuccessRes(
      res,
      res.__("Notification list get successfully."),
      notification_list_count,
      notification_list,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const changeFullName = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { full_name, ln } = req.body;
    i18n.setLocale(req, ln);

    const result = await users.updateOne(
      {
        _id: user_id,
      },
      {
        $set: {
          full_name: full_name,
        },
      },
    );

    if (result.matchedCount === 0) {
      await errorRes(res, res.__("User not found."));
      return;
    }

    await successRes(res, res.__("Full name changed successfully."), []);
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const checkReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;

    const { reviewed_user_id, ln } = req.body;
    i18n.setLocale(req, ln);

    if (user_id.toString() === reviewed_user_id.toString()) {
      await errorRes(res, res.__("You cannot review yourself."));
      return;
    }

    const existingReview = await findExistingReview(user_id, reviewed_user_id);
    if (existingReview) {
      await errorRes(res, res.__("You have already reviewed this user."));
      return;
    }

    await successRes(res, res.__("You can add review."), []);
    return;
  } catch (error) {
    console.log("Error: ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const addReview = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.user._id;

    const { reviewed_user_id, rating, review, ln } = req.body;
    i18n.setLocale(req, ln);

    if (user_id.toString() === reviewed_user_id.toString()) {
      await errorRes(res, res.__("You cannot review yourself."));
      return;
    }

    const existingReview = await findExistingReview(user_id, reviewed_user_id);
    if (existingReview) {
      await errorRes(res, res.__("You have already reviewed this user."));
      return;
    }

    const newReview = await user_reviews.create({
      user_id,
      reviewed_user_id,
      rating,
      review,
    });

    if (newReview) {
      const otherUserObjectId = await objectId(reviewed_user_id);
      const userObjectId = await objectId(user_id);
      const userData = await findUser(user_id);

      if (
        !userData ||
        typeof userData !== "object" ||
        !("full_name" in userData)
      ) {
        await errorRes(res, res.__("User not found."));
        return;
      }
      const userAlbumData = await findUserAlbum(String(userObjectId));
      const noti_msg = `"${newReview.review}" - You received a ${newReview.rating} - star review from ${userData.full_name}`;
      const noti_title = "New Review Received";
      const noti_for = "new_review";
      const noti_image = ((process.env.BUCKET_URL as string) +
        userAlbumData) as string;

      const deviceTokenData = await findDeviceToken(String(otherUserObjectId));
      const notiData = {
        noti_msg,
        noti_title,
        noti_for,
        noti_image,
        review_id: newReview._id,
        id: userObjectId,
      };
      await notifications.create({
        sender_id: userObjectId,
        receiver_id: otherUserObjectId,
        receiver_ids: otherUserObjectId,
        noti_title: noti_title,
        noti_msg: `"review" - You received a rating - star review from full_name`,
        noti_for: noti_for,
        review_id: newReview._id,
      });

      if (Array.isArray(deviceTokenData) && deviceTokenData.length > 0) {
        multiNotificationSend({
          ...notiData,
          device_token: deviceTokenData, // only string[]
          id: String(userObjectId),
          sound_name: "default",
        });
        incNotificationBadge(String(otherUserObjectId));
      }
    }

    await successRes(res, res.__("Review added successfully."), newReview);
    return;
  } catch (error) {
    console.log("Error: ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const editReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { review_id, rating, review, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_review = await findReview(review_id);
    if (!find_review) {
      await errorRes(res, res.__("Review not found."));
      return;
    }

    const find_own_review = await findOwnReview(user_id, review_id);
    if (!find_own_review) {
      await errorRes(
        res,
        res.__("You don't have permission to edit this review."),
      );
      return;
    }

    await user_reviews.updateOne(
      { _id: review_id },
      {
        $set: {
          rating: rating,
          review: review,
        },
      },
    );

    const updatedReview = await findReview(review_id);

    await successRes(
      res,
      res.__("Review updated successfully."),
      updatedReview,
    );
    return;
  } catch (error) {
    console.log("Error: ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const deleteReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { review_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_review = await findReview(review_id);
    if (!find_review) {
      await errorRes(res, res.__("Review not found."));
      return;
    }

    const find_own_review = await findOwnReview(user_id, review_id);
    if (!find_own_review) {
      await errorRes(
        res,
        res.__("You don't have permission to delete this review."),
      );
      return;
    }

    await user_reviews.deleteOne({ _id: review_id });
    await notifications.deleteMany({ review_id: review_id });

    await successRes(res, res.__("Review deleted successfully."), []);
    return;
  } catch (error) {
    console.log("Error: ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const getUserReview = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { reviewed_user_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const reviewObjectId = await objectId(reviewed_user_id);

    const result = await user_reviews.aggregate([
      {
        $match: { reviewed_user_id: reviewObjectId },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    if (!result.length) {
      await errorRes(res, res.__("No reviews found."));
      return;
    }

    const res_data = {
      average_rating: Number(result[0].averageRating).toFixed(1),
      total_review: result[0].totalReviews,
    };
    await successRes(res, res.__("Reviews fetched successfully."), res_data);
    return;
  } catch (error) {
    console.log("Error: ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const userReviewList = async (
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
      res.__("Reviews list fetched successfully."),
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

export const userReviewDetail = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { reviewed_user_id, ln } = req.body;
    i18n.setLocale(req, ln);

    const reviewObjectId = await objectId(reviewed_user_id);

    const find_user = await findUser(String(reviewObjectId));
    if (
      !find_user ||
      typeof find_user !== "object" ||
      !("_id" in find_user) ||
      !("_doc" in find_user)
    ) {
      await errorRes(res, res.__("User not found."));
      return;
    }
    const user_album = await findUserAlbum(String(find_user._id));

    const result = await user_reviews.aggregate([
      {
        $match: { reviewed_user_id: reviewObjectId },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
        },
      },
    ]);

    const res_data = {
      ...(find_user._doc as IUser),
      user_profile: user_album
        ? (process.env.BUCKET_URL as string) + user_album
        : null,
      average_rating:
        result.length > 0 ? Number(result[0].averageRating).toFixed(1) : "0",
      total_review: result.length > 0 ? result[0].totalReviews : 0,
    };
    await successRes(
      res,
      res.__("Reviews detail fetched successfully."),
      res_data,
    );
    return;
  } catch (error) {
    console.log("Error: ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const faqListing = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { ln } = req.body;
    i18n.setLocale(req, ln);

    const list_faq = await faqs.aggregate([
      {
        $match: {
          is_active: true,
        },
      },
      {
        $sort: { createdAt: 1 },
      },
      {
        $project: {
          _id: 1,
          question: 1,
          answer: 1,
        },
      },
    ]);

    await successRes(res, res.__("Faq list get successfully."), list_faq);
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const uploadSocketMedia = async (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  req: Request & { files?: any },
  res: Response,
): Promise<void> => {
  try {
    const { album_type, ln } = req.body as {
      album_type?: string;
      ln: string;
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let { album, thumbnail }: { album: any; thumbnail?: any } = req.files ?? {};

    i18n.setLocale(req, ln);

    if (album && !Array.isArray(album)) album = [album];
    if (thumbnail && !Array.isArray(thumbnail)) thumbnail = [thumbnail];

    if (!album || !Array.isArray(album)) {
      errorRes(res, res.__("No media files provided."));
      return;
    }

    const albumTypes: string[] = album_type ? JSON.parse(album_type) : [];
    const uploadedFiles: {
      file_type: string;
      file_name: string;
      file_path: string;
      thumbnail: string | null;
    }[] = [];

    const folder_name = "socket_media";
    const folder_name_thumbnail = "video_thumbnail";

    for (let i = 0; i < albumTypes.length; i++) {
      const album_type_i = albumTypes[i];
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

      const file_name = res_upload_file.file_name!;
      const user_image_path = `${folder_name}/${file_name}`;

      if (album_type_i === "image") {
        uploadedFiles.push({
          file_type: album_type_i,
          file_name,
          file_path: user_image_path,
          thumbnail: null,
        });
        continue;
      }

      if (album_type_i === "video") {
        let thumbnail_image_path: string | null = null;

        if (thumbnail && thumbnail[i]) {
          const thumbSrc = thumbnail[i];
          const mediaThumb: MediaFile = {
            originalFilename: thumbSrc.originalFilename,
            path: thumbSrc.path,
            mimetype: thumbSrc.type,
            data: Buffer.alloc(0),
          };

          const res_upload_thumb = await uploadMediaIntoS3Bucket(
            mediaThumb,
            folder_name_thumbnail,
            thumbSrc.type,
          );

          if (!res_upload_thumb.status) {
            errorRes(res, res.__("Media upload failed for one of the files."));
            return;
          }

          thumbnail_image_path = `${folder_name_thumbnail}/${res_upload_thumb.file_name}`;
        }

        uploadedFiles.push({
          file_type: album_type_i,
          file_name,
          file_path: user_image_path,
          thumbnail: thumbnail_image_path,
        });
      }
    }

    successRes(res, res.__("All media uploaded successfully."), uploadedFiles);
  } catch (error) {
    console.error("Error :", error);
    errorRes(res, res.__("Internal server error"));
  }
};

export const userUpdatedData = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;
    const { ln } = req.body;
    i18n.setLocale(req, ln);

    const find_user = await findUser(user_id);
    if (
      !find_user ||
      typeof find_user !== "object" ||
      !("_id" in find_user) ||
      !("_doc" in find_user)
    ) {
      await errorRes(res, res.__("User not found."));
      return;
    }
    const user_album = await findUserAlbum(String(find_user._id));
    const album_id = await findUserAlbumId(String(find_user._id));

    const res_data = {
      ...(find_user._doc as unknown as IUser),
      user_profile: user_album
        ? (process.env.BUCKET_URL as string) + user_album
        : null,
      album_id: album_id,
    };
    await successRes(res, res.__("Successfully updated user data."), res_data);
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const userList = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.user._id;
    const usersList = await users.find(
      {
        _id: { $ne: user_id },
        user_type: "user",
        is_deleted: false,
      },
      { full_name: 1, email_address: 1, _id: 1 },
    );
    await successRes(
      res,
      res.__("User list retrieved successfully."),
      usersList,
    );
    return;
  } catch (error) {
    console.log("Error: ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const checkReport = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;

    const { reported_user_id, ln } = req.body;
    i18n.setLocale(req, ln);

    if (user_id.toString() === reported_user_id.toString()) {
      await errorRes(res, res.__("You cannot report yourself."));
      return;
    }

    const existingReport = await findExistingReport(user_id, reported_user_id);
    if (existingReport) {
      await errorRes(res, res.__("You have already reported this user."));
      return;
    }

    await successRes(res, res.__("You can add report."), {});
    return;
  } catch (error) {
    console.log("Error: ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const addReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const user_id = req.user._id;

    const { reported_user_id, ln } = req.body;
    i18n.setLocale(req, ln);

    if (user_id.toString() === reported_user_id.toString()) {
      await errorRes(res, res.__("You cannot report yourself."));
      return;
    }

    const existingReport = await findExistingReport(user_id, reported_user_id);
    if (existingReport) {
      await errorRes(res, res.__("You have already reported this user."));
      return;
    }

    const newReport = await report_users.create({ user_id, reported_user_id });

    await successRes(res, res.__("Report added successfully."), newReport);
    return;
  } catch (error) {
    console.log("Error: ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

interface PushNotificationData {
  device_token: string[];
  noti_title: string;
  noti_msg: string;
  noti_for: string;
  id: string;
  sound_name: string;
  noti_image?: string;
  chat_room_id?: string;
  sender_id?: string;
  pet_id?: string;
}

interface AddPaymentBody {
  pet_id: string;
  payment_id: string;
  payment_method: string;
  payment_status: string;
  amount: number;
  ln?: string;
}

export interface AuthRequest
  extends Request<Record<string, never>, unknown, AddPaymentBody> {
  user: { _id: string };
}

export const addPayment = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;

    const { pet_id, payment_id, payment_method, payment_status, amount, ln } =
      req.body;
    i18n.setLocale(req, ln);

    const existingReview = await findExistingPayment(user_id, pet_id);
    if (existingReview) {
      await errorRes(res, res.__("You have already paid for this pet."));
      return;
    }

    const petIdLast5 = pet_id.slice(-5);
    const transaction_id = `${petIdLast5}`;

    const newPayment = await payments.create({
      user_id,
      pet_id,
      payment_method,
      payment_status,
      amount,
      payment_id,
      transaction_id,
    });

    if (newPayment) {
      const userObjectId = await objectId(user_id);

      const find_pet = await findPet(pet_id);
      const deviceTokenResult = await findDeviceToken(String(userObjectId));
      const deviceTokenData: string[] = Array.isArray(deviceTokenResult)
        ? deviceTokenResult
        : [];

      if (
        !find_pet ||
        typeof find_pet !== "object" ||
        !("pet_name" in find_pet) ||
        !("_id" in find_pet)
      ) {
        await errorRes(res, res.__("Pet not found."));
        return;
      }

      const noti_msg = `Your pet "${find_pet.pet_name}" is now live and visible to others!`;
      const noti_title = "Listing Published";
      const noti_for = "pet_published";
      const notiData: PushNotificationData = {
        noti_msg,
        noti_title,
        noti_for,
        device_token: deviceTokenData,
        pet_id: String(find_pet._id),
        id: String(find_pet._id),
        sound_name: "default", // required by multiNotificationSend
      };
      await notifications.create({
        sender_id: userObjectId,
        receiver_id: userObjectId,
        noti_title,
        noti_msg,
        noti_for,
        pet_id: find_pet._id,
      });

      if (deviceTokenData.length > 0) {
        await multiNotificationSend(notiData);
      }
    }

    await successRes(res, res.__("Payment added successfully."), newPayment);
  } catch (error) {
    console.log("Error: ", error);
    await errorRes(res, res.__("Internal server error"));
  }
};

export const paymentList = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    let user_id;

    if (req.user._id) {
      user_id = req.user._id;
    } else {
      user_id = req.body.user_id;
    }

    const { page = 1, limit = 10, ln } = req.body;
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

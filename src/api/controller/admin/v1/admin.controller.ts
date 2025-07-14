import i18n from "i18n";
import { Request, Response } from "express";
import { userToken } from "../../../../util/token";
import { users } from "../../../model/model.users";
import { user_sessions } from "../../../model/model.user_sessions";
import { pets } from "../../../model/model.pets";
import { payments } from "../../../model/model.payments";
import { services } from "../../../model/model.services";
import { communities } from "../../../model/model.communities";
import { email_verifications } from "../../../model/model.email_varifications";

import { errorRes, successRes } from "../../../../util/response_functions";

import { sendOtpForgotPasswordAdmin } from "../../../../util/send_mail";

import {
  findVerifyEmailAddress,
  findEmailAddress,
  findUser,
} from "../../../../util/user_function";

import {
  securePassword,
  comparePassword,
} from "../../../../util/secure_password";

export interface IAdminRequest extends Request {
  user: {
    id: string;
    _id: string;
    email_address: string;
    password: string;
    user_type: string;
    token: string;
  };
}

export const adminSignUp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email_address, password, device_type, device_token, ln } = req.body;
    i18n.setLocale(req, ln);

    const check_admin_email = await findVerifyEmailAddress(email_address);

    if (check_admin_email) {
      await errorRes(
        res,
        res.__(
          "This email address is already registered. Please use a different email or log in to your existing account.",
        ),
      );
      return;
    }

    const hashedPassword = await securePassword(password);

    const insert_admin_data = {
      email_address,
      password: hashedPassword,
      user_type: "admin",
    };

    await email_verifications.create({
      email_address: email_address,
      is_email_verified: true,
    });
    const create_admin = await users.create(insert_admin_data);
    const token = await userToken(create_admin);

    const insert_admin_session_data = {
      device_token,
      device_type,
      auth_token: token,
      user_id: create_admin._id,
      user_type: "admin",
      is_login: true,
    };

    await user_sessions.create(insert_admin_session_data);

    const response_data = {
      ...create_admin.toObject(),
      token: token,
    };

    await successRes(
      res,
      res.__("Admin account created successfully."),
      response_data,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const adminSignIn = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email_address, password, device_type, device_token, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_admin = await findEmailAddress(email_address);

    if (!find_admin) {
      await errorRes(
        res,
        res.__("No account found associated with this email address."),
      );
      return;
    }

    const password_verify = await comparePassword(
      password,
      find_admin.password as string,
    );

    if (!password_verify) {
      await errorRes(
        res,
        res.__("The password you entered is incorrect. Please try again."),
      );
      return;
    }

    const token = await userToken(find_admin);

    const insert_admin_session_data = {
      device_token,
      device_type,
      auth_token: token,
      user_id: find_admin._id,
      user_type: "admin",
      is_login: true,
    };

    await user_sessions.create(insert_admin_session_data);

    delete find_admin.password;

    const response_data = {
      ...find_admin.toObject(),
      token: token,
    };

    await successRes(
      res,
      res.__("Admin logged in successfully."),
      response_data,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const adminChangePassword = async (
  req: IAdminRequest,
  res: Response,
): Promise<void> => {
  try {
    const { old_password, new_password, ln } = req.body;
    const { _id, password, token } = req.user;

    i18n.setLocale(req, ln);

    const password_verify = await comparePassword(old_password, password);

    if (!password_verify) {
      await errorRes(
        res,
        res.__("The old password you entered is incorrect. Please try again."),
      );
      return;
    }

    const hashedPassword = await securePassword(new_password);

    const find_admin = await findUser(_id);

    if (!find_admin || "success" in find_admin) {
      await errorRes(res, res.__("Admin not found. Please try again."));
      return;
    }

    if (find_admin.password === hashedPassword) {
      await errorRes(
        res,
        res.__(
          "The new password cannot be the same as the old password. Please choose a different password.",
        ),
      );
      return;
    }

    const update_data = {
      password: hashedPassword,
    };

    await users.findByIdAndUpdate(_id, update_data);
    await user_sessions.deleteMany({
      user_id: _id,
      auth_token: { $ne: token },
    });

    await successRes(
      res,
      res.__("Your password has been successfully changed."),
      {},
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const adminSendOtpForgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email_address, ln } = req.body;
    i18n.setLocale(req, ln);

    const login_data = await findEmailAddress(email_address);

    if (!login_data) {
      await errorRes(
        res,
        res.__("No account associated with this email address was found."),
      );
      return;
    }

    const otp = Math.floor(1000 + Math.random() * 8000).toString();

    const data = {
      otp,
      emailAddress: email_address,
    };

    await sendOtpForgotPasswordAdmin(data);

    const update_data = {
      otp,
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

    await successRes(
      res,
      res.__("An OTP has been successfully sent to your email."),
      otp,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const adminVerifyOtp = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email_address, otp, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_admin = await findVerifyEmailAddress(email_address);

    if (!find_admin || "success" in find_admin) {
      await errorRes(
        res,
        res.__("No account associated with this email address was found."),
      );
      return;
    }

    if (find_admin.otp === otp) {
      const update_data = {
        otp: null,
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

      await successRes(res, res.__("OTP verified successfully."), {});
      return;
    } else {
      await errorRes(res, res.__("Please enter a valid OTP."));
      return;
    }
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const adminResetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email_address, password, ln } = req.body;
    i18n.setLocale(req, ln);

    const find_admin = await findEmailAddress(email_address);

    if (!find_admin) {
      await errorRes(
        res,
        res.__("No account found with the provided email address."),
      );
      return;
    }

    const hashedPassword = await securePassword(password);

    const update_data = {
      password: hashedPassword,
    };

    await users.findByIdAndUpdate(find_admin._id, update_data, {
      new: true,
    });

    await successRes(
      res,
      res.__("Your password has been successfully reset."),
      {},
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const adminLogout = async (
  req: IAdminRequest,
  res: Response,
): Promise<void> => {
  try {
    const user_id = req.user._id;

    const { ln } = req.body;
    const { token } = req.user;
    i18n.setLocale(req, ln);

    const find_admin = await findUser(user_id);

    if (!find_admin) {
      await errorRes(res, res.__("User not found."));
      return;
    } else {
      await user_sessions.deleteMany({ user_id: user_id, auth_token: token });

      await successRes(res, res.__("You have successfully logged out."), []);
      return;
    }
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

export const dashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { ln } = req.body;
    i18n.setLocale(req, ln);

    const adminDashboard = {
      users: 0,
      pets: 0,
      services: 0,
      communities: 0,
      total_amount: 0,
      transactions: 0,
    };

    const [
      find_user_count,
      find_pets_count,
      find_services_count,
      find_communities_count,
      find_total_amount,
      find_transactions,
    ] = await Promise.all([
      users.countDocuments({ user_type: "user", is_deleted: false }),
      pets.countDocuments({ is_deleted: false }),
      services.countDocuments({ is_deleted: false }),
      communities.countDocuments({ is_deleted: false }),
      payments.aggregate([
        {
          $match: {
            is_deleted: false,
          },
        },
        {
          $group: {
            _id: null,
            total_amount: { $sum: "$amount" },
          },
        },
        {
          $project: {
            _id: 0,
            total_amount: 1,
          },
        },
      ]),
      payments.countDocuments({ is_deleted: false }),
    ]);

    const total_amount = find_total_amount[0]?.total_amount || 0;

    const res_data = {
      ...adminDashboard,
      users: find_user_count,
      pets: find_pets_count,
      services: find_services_count,
      communities: find_communities_count,
      total_amount: total_amount,
      transactions: find_transactions,
    };

    await successRes(
      res,
      res.__("Data has been successfully loaded."),
      res_data,
    );
    return;
  } catch (error) {
    console.log("Error : ", error);
    await errorRes(res, res.__("Internal server error"));
    return;
  }
};

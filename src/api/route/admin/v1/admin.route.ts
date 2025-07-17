import express, { RequestHandler } from "express";
const admin_router = express.Router();
import multipart from "connect-multiparty";
const multipartMiddleware = multipart();

import { userAuth } from "../../../middlewares/auth";
import { validateRequest } from "../../../middlewares/validation";
import {
  adminSignUp,
  adminSignIn,
  adminChangePassword,
  adminSendOtpForgotPassword,
  adminVerifyOtp,
  adminResetPassword,
  adminLogout,
  dashboard,
} from "../../../controller/admin/v1/admin.controller";

import {
  adminSignUpDto,
  adminSignInDto,
  adminChangePasswordDto,
  adminSendOtpForgotPasswordDto,
  adminVerifyOtpDto,
  adminResetPasswordDto,
  adminLogoutDto,
  dashboardDto,
} from "./../../../dto/admin/v1/admin_dto";

admin_router.post(
  "/sign_up",
  multipartMiddleware,
  validateRequest(adminSignUpDto),
  adminSignUp,
);
admin_router.post(
  "/sign_in",
  multipartMiddleware,
  validateRequest(adminSignInDto),
  adminSignIn,
);
admin_router.post(
  "/change_password",
  userAuth,
  multipartMiddleware,
  validateRequest(adminChangePasswordDto),
  adminChangePassword as RequestHandler,
);
admin_router.post(
  "/send_otp_forgot_password",
  multipartMiddleware,
  validateRequest(adminSendOtpForgotPasswordDto),
  adminSendOtpForgotPassword,
);
admin_router.post(
  "/verify_otp",
  multipartMiddleware,
  validateRequest(adminVerifyOtpDto),
  adminVerifyOtp,
);
admin_router.post(
  "/reset_password",
  multipartMiddleware,
  validateRequest(adminResetPasswordDto),
  adminResetPassword,
);
admin_router.post(
  "/logout",
  userAuth,
  multipartMiddleware,
  validateRequest(adminLogoutDto),
  adminLogout as RequestHandler,
);
admin_router.post(
  "/dashboard",
  userAuth,
  multipartMiddleware,
  validateRequest(dashboardDto),
  dashboard,
);

export default admin_router;

import express, { Request } from "express";
const app_router = express.Router();
import { AuthRequest } from "./../../../controller/app/v1/user.controller";
import multipart from "connect-multiparty";
const multipartMiddleware = multipart();

import { validateRequest } from "../../../middlewares/validation";
import { userAuth, userAuthLogout } from "../../../middlewares/auth";

import {
  guestSession,
  checkEmailAddress,
  checkMobileNumber,
  signUp,
  signIn,
  changePassword,
  forgotPassword,
  verifyOtp,
  resetPassword,
  logout,
  deleteAccount,
  uploadMedia,
  removeMedia,
  deleteAllNotifications,
  notificationsList,
  changeFullName,
  checkReview,
  addReview,
  editReview,
  deleteReview,
  getUserReview,
  userReviewList,
  userReviewDetail,
  faqListing,
  uploadSocketMedia,
  userUpdatedData,
  userList,
  checkReport,
  addReport,
  addPayment,
  paymentList,
} from "../../../controller/app/v1/user.controller";

import {
  guestSessionDto,
  checkEmailAddressDto,
  checkMobileNumberDto,
  signUpDto,
  signInDto,
  changePasswordDto,
  forgotPasswordDto,
  verifyOtpDto,
  resetPasswordDto,
  logoutDto,
  deleteAccountDto,
  uploadMediaDto,
  removeMediaDto,
  notificationsListDto,
  changeFullNameDto,
  checkReviewDto,
  addReviewDto,
  editReviewDto,
  deleteReviewDto,
  getUserReviewDto,
  userReviewListDto,
  userReviewDetailDto,
  faqListingDto,
  userUpdatedDataDto,
  checkReportDto,
  addReportDto,
  addPaymentDto,
  paymentListDto,
} from "./../../../dto/app/v1/user_dto";

app_router.post(
  "/guest_session",
  multipartMiddleware,
  validateRequest(guestSessionDto),
  guestSession,
);
app_router.post(
  "/check_email_address",
  multipartMiddleware,
  validateRequest(checkEmailAddressDto),
  checkEmailAddress,
);
app_router.post(
  "/check_mobile_number",
  multipartMiddleware,
  validateRequest(checkMobileNumberDto),
  checkMobileNumber,
);
app_router.post(
  "/sign_up",
  multipartMiddleware,
  validateRequest(signUpDto),
  signUp,
);
app_router.post(
  "/sign_in",
  multipartMiddleware,
  validateRequest(signInDto),
  (req: Request, res, next) => {
    signIn(req, res).catch(next);
  },
);

app_router.post(
  "/change_password",
  multipartMiddleware,
  userAuth,
  validateRequest(changePasswordDto),
  changePassword,
);
app_router.post(
  "/forgot_password",
  multipartMiddleware,
  validateRequest(forgotPasswordDto),
  forgotPassword,
);
app_router.post(
  "/verify_otp",
  multipartMiddleware,
  validateRequest(verifyOtpDto),
  verifyOtp,
);
app_router.post(
  "/reset_password",
  multipartMiddleware,
  validateRequest(resetPasswordDto),
  resetPassword,
);
app_router.post(
  "/logout",
  userAuthLogout,
  multipartMiddleware,
  validateRequest(logoutDto),
  logout,
);
app_router.post(
  "/delete_account",
  multipartMiddleware,
  userAuth,
  validateRequest(deleteAccountDto),
  deleteAccount,
);

app_router.post(
  "/upload_media",
  userAuth,
  multipartMiddleware,
  validateRequest(uploadMediaDto),
  (req, res, next) => {
    uploadMedia(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      req as Request & { user: { _id: string }; files?: any },
      res,
    ).catch(next);
  },
);

app_router.post(
  "/remove_media",
  userAuth,
  multipartMiddleware,
  validateRequest(removeMediaDto),
  removeMedia,
);
app_router.post(
  "/delete_all_notification",
  userAuth,
  multipartMiddleware,
  deleteAllNotifications,
);
app_router.post(
  "/notification_list",
  userAuth,
  multipartMiddleware,
  validateRequest(notificationsListDto),
  notificationsList,
);
app_router.post(
  "/change_full_name",
  userAuth,
  multipartMiddleware,
  validateRequest(changeFullNameDto),
  changeFullName,
);
app_router.post(
  "/check_review",
  userAuth,
  multipartMiddleware,
  validateRequest(checkReviewDto),
  checkReview,
);
app_router.post(
  "/add_review",
  userAuth,
  multipartMiddleware,
  validateRequest(addReviewDto),
  addReview,
);
app_router.post(
  "/edit_review",
  userAuth,
  multipartMiddleware,
  validateRequest(editReviewDto),
  editReview,
);
app_router.post(
  "/delete_review",
  userAuth,
  multipartMiddleware,
  validateRequest(deleteReviewDto),
  deleteReview,
);
app_router.post(
  "/user_review",
  multipartMiddleware,
  validateRequest(getUserReviewDto),
  getUserReview,
);
app_router.post(
  "/user_review_list",
  multipartMiddleware,
  validateRequest(userReviewListDto),
  userReviewList,
);
app_router.post(
  "/user_review_detail",
  multipartMiddleware,
  validateRequest(userReviewDetailDto),
  userReviewDetail,
);
app_router.post(
  "/faq_listing",
  userAuth,
  multipartMiddleware,
  validateRequest(faqListingDto),
  faqListing,
);
app_router.post("/upload_socket_media", multipartMiddleware, uploadSocketMedia);

app_router.post(
  "/get_user_data",
  userAuth,
  multipartMiddleware,
  validateRequest(userUpdatedDataDto),
  userUpdatedData,
);
app_router.post("/user_list", userAuth, multipartMiddleware, userList);
app_router.post(
  "/check_report",
  userAuth,
  multipartMiddleware,
  validateRequest(checkReportDto),
  checkReport,
);
app_router.post(
  "/report_user",
  userAuth,
  multipartMiddleware,
  validateRequest(addReportDto),
  addReport,
);

app_router.post(
  "/create_payment",
  userAuth,
  multipartMiddleware,
  validateRequest(addPaymentDto),
  (req, res, next) => {
    addPayment(req as AuthRequest, res).catch(next);
  },
);

app_router.post(
  "/payment_list",
  userAuth,
  multipartMiddleware,
  validateRequest(paymentListDto),
  paymentList,
);

export default app_router;

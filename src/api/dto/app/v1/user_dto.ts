import joi from "joi";

export const guestSessionDto = joi.object().keys({
  device_token: joi.string().allow().label("Device token"),
  device_type: joi.string().allow().label("Device type"),
  location: joi.string().allow().label("Location"),
  address: joi.string().allow().label("Address"),
  ln: joi.string().allow().label("Ln"),
});

export const checkEmailAddressDto = joi.object().keys({
  email_address: joi.string().required().label("Email address"),
  ln: joi.string().allow().label("Ln"),
});

export const checkMobileNumberDto = joi.object().keys({
  mobile_number: joi.string().required().label("Mobile number"),
  ln: joi.string().allow().label("Ln"),
});

export const signUpDto = joi.object().keys({
  full_name: joi.string().allow().label("Full name"),
  email_address: joi.string().allow().label("Email address"),
  country_code: joi.string().allow().label("Country code"),
  country_string_code: joi.string().allow().label("Country string code"),
  mobile_number: joi.string().allow().label("Mobile number"),
  is_social_login: joi.string().allow().label("Is social login"),
  social_id: joi.string().allow().label("Social id"),
  social_platform: joi.string().allow().label("Social platform"),
  device_token: joi.string().allow().label("Device token"),
  device_type: joi.string().allow().label("Device type"),
  password: joi.string().allow().label("Password"),
  location: joi.string().allow().label("Location"),
  address: joi.string().allow().label("Address"),
  ln: joi.string().allow().label("Ln"),
});

export const signInDto = joi.object().keys({
  email_address: joi.string().allow().label("Email address"),
  device_token: joi.string().allow().label("Device token"),
  full_name: joi.string().allow().label("Full name"),
  device_type: joi.string().allow().label("Device type"),
  is_social_login: joi.string().allow().label("Is social login"),
  social_id: joi.string().allow().label("Social id"),
  social_platform: joi.string().allow().label("Social platform"),
  password: joi.string().allow().label("Password"),
  location: joi.string().allow().label("Location"),
  address: joi.string().allow().label("Address"),
  ln: joi.string().allow().label("Ln"),
});

export const changePasswordDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  old_password: joi.string().allow().label("Old password"),
  new_password: joi.string().allow().label("New password"),
  ln: joi.string().allow().label("Ln"),
});

export const forgotPasswordDto = joi.object().keys({
  email_address: joi.string().allow().label("Email address"),
  ln: joi.string().allow().label("Ln"),
});

export const verifyOtpDto = joi.object().keys({
  email_address: joi.string().allow().label("Email address"),
  otp: joi.string().allow().label("Otp"),
  ln: joi.string().allow().label("Ln"),
});

export const resetPasswordDto = joi.object().keys({
  email_address: joi.string().allow().label("Email address"),
  mobile_number: joi.string().allow().label("Mobile number"),
  new_password: joi.string().allow().label("New password"),
  ln: joi.string().allow().label("Ln"),
});

export const logoutDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  logout_user_id: joi.allow().label("Logout user id"),
  device_token: joi.string().allow().label("Device token"),
  ln: joi.string().allow().label("Ln"),
});

export const deleteAccountDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  device_token: joi.string().allow().label("Device token"),
  ln: joi.string().allow().label("Ln"),
});

export const uploadMediaDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  album_type: joi.string().allow().label("Album type"),
  ln: joi.string().allow().label("Ln"),
});

export const removeMediaDto = joi.object().keys({
  user_id: joi.string().allow().label("User id"),
  album_id: joi.string().allow().label("Album Id"),
  ln: joi.string().allow().label("Ln"),
});

export const notificationsListDto = joi.object().keys({
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});

export const changeFullNameDto = joi.object().keys({
  full_name: joi.string().required().label("Full name"),
  ln: joi.string().allow().label("Ln"),
});

export const checkReviewDto = joi.object().keys({
  reviewed_user_id: joi.string().required().label("Reviewed user id"),
  ln: joi.string().allow().label("Ln"),
});

export const addReviewDto = joi.object().keys({
  reviewed_user_id: joi.string().required().label("Reviewed user id"),
  rating: joi.required().label("Rating"),
  review: joi.required().label("Review"),
  ln: joi.string().allow().label("Ln"),
});

export const editReviewDto = joi.object().keys({
  review_id: joi.string().required().label("Review id"),
  rating: joi.required().label("Rating"),
  review: joi.required().label("Review"),
  ln: joi.string().allow().label("Ln"),
});

export const deleteReviewDto = joi.object().keys({
  review_id: joi.string().required().label("Review id"),
  ln: joi.string().allow().label("Ln"),
});

export const getUserReviewDto = joi.object().keys({
  reviewed_user_id: joi.string().required().label("Reviewed user id"),
  ln: joi.string().allow().label("Ln"),
});

export const userReviewListDto = joi.object().keys({
  reviewed_user_id: joi.string().required().label("Reviewed user id"),
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});

export const userReviewDetailDto = joi.object().keys({
  reviewed_user_id: joi.string().required().label("Reviewed user id"),
  ln: joi.string().allow().label("Ln"),
});

export const faqListingDto = joi.object().keys({
  ln: joi.string().allow().label("Ln"),
});

export const userUpdatedDataDto = joi.object().keys({
  ln: joi.string().allow().label("Ln"),
});

export const checkReportDto = joi.object().keys({
  reported_user_id: joi.string().allow().label("Reported user id"),
  ln: joi.string().allow().label("Ln"),
});

export const addReportDto = joi.object().keys({
  reported_user_id: joi.string().allow().label("Reported user id"),
  ln: joi.string().allow().label("Ln"),
});

export const addPaymentDto = joi.object().keys({
  pet_id: joi.string().allow().label("Pet id"),
  payment_id: joi.string().allow().label("Payment id"),
  payment_method: joi.string().allow().label("Payment method"),
  payment_status: joi.string().allow().label("Payment status"),
  amount: joi.string().allow().label("Amount"),
  ln: joi.string().allow().label("Ln"),
});

export const paymentListDto = joi.object().keys({
  page: joi.allow().label("Page"),
  limit: joi.allow().label("Limit"),
  ln: joi.string().allow().label("Ln"),
});

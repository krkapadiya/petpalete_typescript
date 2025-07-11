import joi from "joi";

export const adminSignUpDto = joi.object().keys({
  email_address: joi.string().email().required().label("Email address"),
  password: joi.string().allow().label("Password"),
  device_type: joi.string().required().valid("web").label("Device type"),
  device_token: joi.string().allow().label("Device token"),
  ln: joi.string().allow().label("Ln"),
});

export const adminSignInDto = joi.object().keys({
  email_address: joi.string().email().required().label("Email address"),
  password: joi.string().allow().label("Password"),
  device_type: joi.string().required().valid("web").label("Device type"),
  device_token: joi.string().allow().label("Device token"),
  ln: joi.string().allow().label("Ln"),
});

export const adminChangePasswordDto = joi.object().keys({
  old_password: joi.string().allow().label("Old password"),
  new_password: joi.string().allow().label("New password"),
  ln: joi.string().allow().label("Ln"),
});

export const adminSendOtpForgotPasswordDto = joi.object().keys({
  email_address: joi.string().email().required().label("Email address"),
  ln: joi.string().allow().label("Ln"),
});

export const adminVerifyOtpDto = joi.object().keys({
  email_address: joi.string().email().required().label("Email address"),
  otp: joi.allow().label("Otp"),
  ln: joi.string().allow().label("Ln"),
});

export const adminResetPasswordDto = joi.object().keys({
  email_address: joi.string().email().required().label("Email address"),
  password: joi.string().allow().label("Password"),
  ln: joi.string().allow().label("Ln"),
});

export const adminLogoutDto = joi.object().keys({
  ln: joi.string().allow().label("Ln"),
});

export const dashboardDto = joi.object().keys({
  ln: joi.string().allow().label("Ln"),
});

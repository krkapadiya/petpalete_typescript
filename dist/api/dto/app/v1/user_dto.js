"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentListDto = exports.addPaymentDto = exports.addReportDto = exports.checkReportDto = exports.userUpdatedDataDto = exports.faqListingDto = exports.userReviewDetailDto = exports.userReviewListDto = exports.getUserReviewDto = exports.deleteReviewDto = exports.editReviewDto = exports.addReviewDto = exports.checkReviewDto = exports.changeFullNameDto = exports.notificationsListDto = exports.removeMediaDto = exports.uploadMediaDto = exports.deleteAccountDto = exports.logoutDto = exports.resetPasswordDto = exports.verifyOtpDto = exports.forgotPasswordDto = exports.changePasswordDto = exports.signInDto = exports.signUpDto = exports.checkMobileNumberDto = exports.checkEmailAddressDto = exports.guestSessionDto = void 0;
const joi_1 = __importDefault(require("joi"));
exports.guestSessionDto = joi_1.default.object().keys({
    device_token: joi_1.default.string().allow().label("Device token"),
    device_type: joi_1.default.string().allow().label("Device type"),
    location: joi_1.default.string().allow().label("Location"),
    address: joi_1.default.string().allow().label("Address"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.checkEmailAddressDto = joi_1.default.object().keys({
    email_address: joi_1.default.string().required().label("Email address"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.checkMobileNumberDto = joi_1.default.object().keys({
    mobile_number: joi_1.default.string().required().label("Mobile number"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.signUpDto = joi_1.default.object().keys({
    full_name: joi_1.default.string().allow().label("Full name"),
    email_address: joi_1.default.string().allow().label("Email address"),
    country_code: joi_1.default.string().allow().label("Country code"),
    country_string_code: joi_1.default.string().allow().label("Country string code"),
    mobile_number: joi_1.default.string().allow().label("Mobile number"),
    is_social_login: joi_1.default.string().allow().label("Is social login"),
    social_id: joi_1.default.string().allow().label("Social id"),
    social_platform: joi_1.default.string().allow().label("Social platform"),
    device_token: joi_1.default.string().allow().label("Device token"),
    device_type: joi_1.default.string().allow().label("Device type"),
    password: joi_1.default.string().allow().label("Password"),
    location: joi_1.default.string().allow().label("Location"),
    address: joi_1.default.string().allow().label("Address"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.signInDto = joi_1.default.object().keys({
    email_address: joi_1.default.string().allow().label("Email address"),
    device_token: joi_1.default.string().allow().label("Device token"),
    full_name: joi_1.default.string().allow().label("Full name"),
    device_type: joi_1.default.string().allow().label("Device type"),
    is_social_login: joi_1.default.string().allow().label("Is social login"),
    social_id: joi_1.default.string().allow().label("Social id"),
    social_platform: joi_1.default.string().allow().label("Social platform"),
    password: joi_1.default.string().allow().label("Password"),
    location: joi_1.default.string().allow().label("Location"),
    address: joi_1.default.string().allow().label("Address"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.changePasswordDto = joi_1.default.object().keys({
    user_id: joi_1.default.string().allow().label("User id"),
    old_password: joi_1.default.string().allow().label("Old password"),
    new_password: joi_1.default.string().allow().label("New password"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.forgotPasswordDto = joi_1.default.object().keys({
    email_address: joi_1.default.string().allow().label("Email address"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.verifyOtpDto = joi_1.default.object().keys({
    email_address: joi_1.default.string().allow().label("Email address"),
    otp: joi_1.default.string().allow().label("Otp"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.resetPasswordDto = joi_1.default.object().keys({
    email_address: joi_1.default.string().allow().label("Email address"),
    mobile_number: joi_1.default.string().allow().label("Mobile number"),
    new_password: joi_1.default.string().allow().label("New password"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.logoutDto = joi_1.default.object().keys({
    user_id: joi_1.default.string().allow().label("User id"),
    logout_user_id: joi_1.default.allow().label("Logout user id"),
    device_token: joi_1.default.string().allow().label("Device token"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.deleteAccountDto = joi_1.default.object().keys({
    user_id: joi_1.default.string().allow().label("User id"),
    device_token: joi_1.default.string().allow().label("Device token"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.uploadMediaDto = joi_1.default.object().keys({
    user_id: joi_1.default.string().allow().label("User id"),
    album_type: joi_1.default.string().allow().label("Album type"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.removeMediaDto = joi_1.default.object().keys({
    user_id: joi_1.default.string().allow().label("User id"),
    album_id: joi_1.default.string().allow().label("Album Id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.notificationsListDto = joi_1.default.object().keys({
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.changeFullNameDto = joi_1.default.object().keys({
    full_name: joi_1.default.string().required().label("Full name"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.checkReviewDto = joi_1.default.object().keys({
    reviewed_user_id: joi_1.default.string().required().label("Reviewed user id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.addReviewDto = joi_1.default.object().keys({
    reviewed_user_id: joi_1.default.string().required().label("Reviewed user id"),
    rating: joi_1.default.required().label("Rating"),
    review: joi_1.default.required().label("Review"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.editReviewDto = joi_1.default.object().keys({
    review_id: joi_1.default.string().required().label("Review id"),
    rating: joi_1.default.required().label("Rating"),
    review: joi_1.default.required().label("Review"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.deleteReviewDto = joi_1.default.object().keys({
    review_id: joi_1.default.string().required().label("Review id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.getUserReviewDto = joi_1.default.object().keys({
    reviewed_user_id: joi_1.default.string().required().label("Reviewed user id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.userReviewListDto = joi_1.default.object().keys({
    reviewed_user_id: joi_1.default.string().required().label("Reviewed user id"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.userReviewDetailDto = joi_1.default.object().keys({
    reviewed_user_id: joi_1.default.string().required().label("Reviewed user id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.faqListingDto = joi_1.default.object().keys({
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.userUpdatedDataDto = joi_1.default.object().keys({
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.checkReportDto = joi_1.default.object().keys({
    reported_user_id: joi_1.default.string().allow().label("Reported user id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.addReportDto = joi_1.default.object().keys({
    reported_user_id: joi_1.default.string().allow().label("Reported user id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.addPaymentDto = joi_1.default.object().keys({
    pet_id: joi_1.default.string().allow().label("Pet id"),
    payment_id: joi_1.default.string().allow().label("Payment id"),
    payment_method: joi_1.default.string().allow().label("Payment method"),
    payment_status: joi_1.default.string().allow().label("Payment status"),
    amount: joi_1.default.string().allow().label("Amount"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.paymentListDto = joi_1.default.object().keys({
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});

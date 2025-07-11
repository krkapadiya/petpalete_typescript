"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardDto = exports.adminLogoutDto = exports.adminResetPasswordDto = exports.adminVerifyOtpDto = exports.adminSendOtpForgotPasswordDto = exports.adminChangePasswordDto = exports.adminSignInDto = exports.adminSignUpDto = void 0;
const joi_1 = __importDefault(require("joi"));
exports.adminSignUpDto = joi_1.default.object().keys({
    email_address: joi_1.default.string().email().required().label("Email address"),
    password: joi_1.default.string().allow().label("Password"),
    device_type: joi_1.default.string().required().valid("web").label("Device type"),
    device_token: joi_1.default.string().allow().label("Device token"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.adminSignInDto = joi_1.default.object().keys({
    email_address: joi_1.default.string().email().required().label("Email address"),
    password: joi_1.default.string().allow().label("Password"),
    device_type: joi_1.default.string().required().valid("web").label("Device type"),
    device_token: joi_1.default.string().allow().label("Device token"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.adminChangePasswordDto = joi_1.default.object().keys({
    old_password: joi_1.default.string().allow().label("Old password"),
    new_password: joi_1.default.string().allow().label("New password"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.adminSendOtpForgotPasswordDto = joi_1.default.object().keys({
    email_address: joi_1.default.string().email().required().label("Email address"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.adminVerifyOtpDto = joi_1.default.object().keys({
    email_address: joi_1.default.string().email().required().label("Email address"),
    otp: joi_1.default.allow().label("Otp"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.adminResetPasswordDto = joi_1.default.object().keys({
    email_address: joi_1.default.string().email().required().label("Email address"),
    password: joi_1.default.string().allow().label("Password"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.adminLogoutDto = joi_1.default.object().keys({
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.dashboardDto = joi_1.default.object().keys({
    ln: joi_1.default.string().allow().label("Ln"),
});

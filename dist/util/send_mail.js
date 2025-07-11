"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpForgotPassword = exports.sendOtpForgotPasswordAdmin = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const sendOtpForgotPasswordAdmin = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        auth: {
            user: process.env.MAIL_FROM_ADDRESS,
            pass: process.env.MAIL_PASSWORD,
        },
    });
    const sendOtp = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: data.emailAddress,
        subject: "PetPaleTe - Reset Password",
        html: `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Admin Panel - Password Reset Request</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap" rel="stylesheet">
    </head>
    <body style="background-color: #fff; font-family: Poppins, sans-serif; display: flex ; justify-content: center;">
      <div style="max-width: 640px; width: 100%; background: #ffffff; border-radius: 20px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
        <div style="background-color: #53473B; height: 115px; border-top-left-radius: 20px; border-top-right-radius: 20px; display: flex ; align-items: center; padding: 0px 48px; justify-content: center;">
          <a href="#"><img src="${process.env.APP_LOGO}" alt="Logo" /></a>
        </div>
        <div style="padding: 30px 48px; font-size: 15px; color: #898B94;">
          <p>Dear Admin,</p>
          <p>We received a request to reset your password for the Admin Panel. Please use the following OTP code to proceed:</p>
          <div style="font-weight: 700; font-size: 30px; letter-spacing: 20px; text-align: center; color: #53473B; padding: 24px 0px;">${data.otp}</div>
          <p>If you did not request a password change, please ignore this email or contact support.</p>
          <p>If you need any assistance, feel free to reach out to us at
            <a href="mailto:${process.env.SUPPORT_MAIL}" style="color: #53473B; font-weight: 500;">${process.env.SUPPORT_MAIL}</a>.
          </p>
          <p>Best regards,<br><span style="font-weight:600;color: #1A1B22;">PetPaleTe Team</span></p>
        </div>
      </div>
    </body>
    </html>`,
    };
    return yield transporter.sendMail(sendOtp);
});
exports.sendOtpForgotPasswordAdmin = sendOtpForgotPasswordAdmin;
const sendOtpForgotPassword = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const transporter = nodemailer_1.default.createTransport({
        host: process.env.MAIL_HOST,
        port: Number(process.env.MAIL_PORT),
        auth: {
            user: process.env.MAIL_FROM_ADDRESS,
            pass: process.env.MAIL_PASSWORD,
        },
    });
    const sendOtp = {
        from: process.env.MAIL_FROM_ADDRESS,
        to: data.emailAddress,
        subject: "PetPaleTe - Reset Password",
        html: `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Forgot Password Code</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
    </head>
    <body style="margin: 0; padding: 20px; background-color: #ffffff; font-family: 'Poppins', sans-serif;">
      <table align="center" cellpadding="0" cellspacing="0" width="640" style="width: 100%; max-width: 640px; background-color: #ffffff; border-radius: 20px; box-shadow: 0 0 10px rgba(0,0,0,0.1); overflow: hidden;">
        <tr>
          <td style="background-color: #53473B; padding: 20px 40px;">
            <table cellpadding="0" cellspacing="0" width="100%">
              <tr>
                <td width="70" style="vertical-align: middle;">
                  <img src="${process.env.APP_LOGO}" alt="App Logo" width="70" height="70" style="border-radius: 10px; display: block;">
                </td>
                <td style="padding-left: 16px; vertical-align: middle;">
                  <h1 style="margin: 0; font-size: 28px; font-weight: 500; color: #ffffff;">PetPaleTe</h1>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding: 30px 48px; font-size: 15px; color: #898B94;">
            <p>Hello ${data.full_name || "User"},</p>
            <p>You have requested to reset your password. Please use the following code to proceed with the password reset:</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="font-weight: 700; font-size: 30px; color: #53473B; padding: 24px 0; letter-spacing: 20px;">
                  ${data.otp}
                </td>
              </tr>
            </table>
            <p>If you did not request a password reset, please ignore this email or contact support.</p>
            <p>If you need any assistance, feel free to reach out to us at 
              <a href="mailto:${process.env.SUPPORT_MAIL}" style="color: #53473B; font-weight: 500;">${process.env.SUPPORT_MAIL}</a>.
            </p>
            <p>Best regards,<br>
              <span style="font-weight: 600; color: #1A1B22;">PetPaleTe Team</span>
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>`,
    };
    return yield transporter.sendMail(sendOtp);
});
exports.sendOtpForgotPassword = sendOtpForgotPassword;

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
exports.dashboard = exports.adminLogout = exports.adminResetPassword = exports.adminVerifyOtp = exports.adminSendOtpForgotPassword = exports.adminChangePassword = exports.adminSignIn = exports.adminSignUp = void 0;
const i18n_1 = __importDefault(require("i18n"));
const token_1 = require("../../../../util/token");
const model_users_1 = require("../../../model/model.users");
const model_user_sessions_1 = require("../../../model/model.user_sessions");
const model_pets_1 = require("../../../model/model.pets");
const model_payments_1 = require("../../../model/model.payments");
const model_services_1 = require("../../../model/model.services");
const model_communities_1 = require("../../../model/model.communities");
const model_email_varifications_1 = require("../../../model/model.email_varifications");
const response_functions_1 = require("../../../../util/response_functions");
const send_mail_1 = require("../../../../util/send_mail");
const user_function_1 = require("../../../../util/user_function");
const secure_password_1 = require("../../../../util/secure_password");
const adminSignUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email_address, password, device_type, device_token, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const check_admin_email = yield (0, user_function_1.findVerifyEmailAddress)(email_address);
        if (check_admin_email) {
            yield (0, response_functions_1.errorRes)(res, res.__("This email address is already registered. Please use a different email or log in to your existing account."));
            return;
        }
        const hashedPassword = yield (0, secure_password_1.securePassword)(password);
        const insert_admin_data = {
            email_address,
            password: hashedPassword,
            user_type: "admin",
        };
        yield model_email_varifications_1.email_verifications.create({
            email_address: email_address,
            is_email_verified: true,
        });
        const create_admin = yield model_users_1.users.create(insert_admin_data);
        const token = yield (0, token_1.userToken)(create_admin);
        const insert_admin_session_data = {
            device_token,
            device_type,
            auth_token: token,
            user_id: create_admin._id,
            user_type: "admin",
            is_login: true,
        };
        yield model_user_sessions_1.user_sessions.create(insert_admin_session_data);
        const response_data = Object.assign(Object.assign({}, create_admin.toObject()), { token: token });
        yield (0, response_functions_1.successRes)(res, res.__("Admin account created successfully."), response_data);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.adminSignUp = adminSignUp;
const adminSignIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email_address, password, device_type, device_token, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_admin = yield (0, user_function_1.findEmailAddress)(email_address);
        if (!find_admin) {
            yield (0, response_functions_1.errorRes)(res, res.__("No account found associated with this email address."));
            return;
        }
        const password_verify = yield (0, secure_password_1.comparePassword)(password, find_admin.password);
        if (!password_verify) {
            yield (0, response_functions_1.errorRes)(res, res.__("The password you entered is incorrect. Please try again."));
            return;
        }
        const token = yield (0, token_1.userToken)(find_admin);
        const insert_admin_session_data = {
            device_token,
            device_type,
            auth_token: token,
            user_id: find_admin._id,
            user_type: "admin",
            is_login: true,
        };
        yield model_user_sessions_1.user_sessions.create(insert_admin_session_data);
        delete find_admin.password;
        const response_data = Object.assign(Object.assign({}, find_admin.toObject()), { token: token });
        yield (0, response_functions_1.successRes)(res, res.__("Admin logged in successfully."), response_data);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.adminSignIn = adminSignIn;
const adminChangePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { old_password, new_password, ln } = req.body;
        const { _id, password, token } = req.user;
        i18n_1.default.setLocale(req, ln);
        const password_verify = yield (0, secure_password_1.comparePassword)(old_password, password);
        if (!password_verify) {
            yield (0, response_functions_1.errorRes)(res, res.__("The old password you entered is incorrect. Please try again."));
            return;
        }
        const hashedPassword = yield (0, secure_password_1.securePassword)(new_password);
        const find_admin = yield (0, user_function_1.findUser)(_id);
        if (!find_admin || "success" in find_admin) {
            yield (0, response_functions_1.errorRes)(res, res.__("Admin not found. Please try again."));
            return;
        }
        if (find_admin.password === hashedPassword) {
            yield (0, response_functions_1.errorRes)(res, res.__("The new password cannot be the same as the old password. Please choose a different password."));
            return;
        }
        const update_data = {
            password: hashedPassword,
        };
        yield model_users_1.users.findByIdAndUpdate(_id, update_data);
        yield model_user_sessions_1.user_sessions.deleteMany({
            user_id: _id,
            auth_token: { $ne: token },
        });
        yield (0, response_functions_1.successRes)(res, res.__("Your password has been successfully changed."), {});
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.adminChangePassword = adminChangePassword;
const adminSendOtpForgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email_address, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const login_data = yield (0, user_function_1.findEmailAddress)(email_address);
        if (!login_data) {
            yield (0, response_functions_1.errorRes)(res, res.__("No account associated with this email address was found."));
            return;
        }
        const otp = Math.floor(1000 + Math.random() * 8000).toString();
        const data = {
            otp,
            emailAddress: email_address,
        };
        yield (0, send_mail_1.sendOtpForgotPasswordAdmin)(data);
        const update_data = {
            otp,
        };
        yield model_email_varifications_1.email_verifications.updateOne({
            email_address: email_address,
            is_email_verified: true,
            is_deleted: false,
        }, {
            $set: update_data,
        });
        yield (0, response_functions_1.successRes)(res, res.__("An OTP has been successfully sent to your email."), otp);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.adminSendOtpForgotPassword = adminSendOtpForgotPassword;
const adminVerifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email_address, otp, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_admin = yield (0, user_function_1.findVerifyEmailAddress)(email_address);
        if (!find_admin || "success" in find_admin) {
            yield (0, response_functions_1.errorRes)(res, res.__("No account associated with this email address was found."));
            return;
        }
        if (find_admin.otp === otp) {
            const update_data = {
                otp: null,
            };
            yield model_email_varifications_1.email_verifications.updateOne({
                email_address: email_address,
                is_email_verified: true,
                is_deleted: false,
            }, {
                $set: update_data,
            });
            yield (0, response_functions_1.successRes)(res, res.__("OTP verified successfully."), {});
            return;
        }
        else {
            yield (0, response_functions_1.errorRes)(res, res.__("Please enter a valid OTP."));
            return;
        }
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.adminVerifyOtp = adminVerifyOtp;
const adminResetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email_address, password, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_admin = yield (0, user_function_1.findEmailAddress)(email_address);
        if (!find_admin) {
            yield (0, response_functions_1.errorRes)(res, res.__("No account found with the provided email address."));
            return;
        }
        const hashedPassword = yield (0, secure_password_1.securePassword)(password);
        const update_data = {
            password: hashedPassword,
        };
        yield model_users_1.users.findByIdAndUpdate(find_admin._id, update_data, {
            new: true,
        });
        yield (0, response_functions_1.successRes)(res, res.__("Your password has been successfully reset."), {});
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.adminResetPassword = adminResetPassword;
const adminLogout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { ln } = req.body;
        const { token } = req.user;
        i18n_1.default.setLocale(req, ln);
        const find_admin = yield (0, user_function_1.findUser)(user_id);
        if (!find_admin) {
            yield (0, response_functions_1.errorRes)(res, res.__("User not found."));
            return;
        }
        else {
            yield model_user_sessions_1.user_sessions.deleteMany({ user_id: user_id, auth_token: token });
            yield (0, response_functions_1.successRes)(res, res.__("You have successfully logged out."), []);
            return;
        }
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.adminLogout = adminLogout;
const dashboard = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const adminDashboard = {
            users: 0,
            pets: 0,
            services: 0,
            communities: 0,
            total_amount: 0,
            transactions: 0,
        };
        const [find_user_count, find_pets_count, find_services_count, find_communities_count, find_total_amount, find_transactions,] = yield Promise.all([
            model_users_1.users.countDocuments({ user_type: "user", is_deleted: false }),
            model_pets_1.pets.countDocuments({ is_deleted: false }),
            model_services_1.services.countDocuments({ is_deleted: false }),
            model_communities_1.communities.countDocuments({ is_deleted: false }),
            model_payments_1.payments.aggregate([
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
            model_payments_1.payments.countDocuments({ is_deleted: false }),
        ]);
        const total_amount = ((_a = find_total_amount[0]) === null || _a === void 0 ? void 0 : _a.total_amount) || 0;
        const res_data = Object.assign(Object.assign({}, adminDashboard), { users: find_user_count, pets: find_pets_count, services: find_services_count, communities: find_communities_count, total_amount: total_amount, transactions: find_transactions });
        yield (0, response_functions_1.successRes)(res, res.__("Data has been successfully loaded."), res_data);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.dashboard = dashboard;

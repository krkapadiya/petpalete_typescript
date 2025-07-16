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
exports.paymentList = exports.addPayment = exports.addReport = exports.checkReport = exports.userList = exports.userUpdatedData = exports.uploadSocketMedia = exports.faqListing = exports.userReviewDetail = exports.userReviewList = exports.getUserReview = exports.deleteReview = exports.editReview = exports.addReview = exports.checkReview = exports.changeFullName = exports.notificationsList = exports.deleteAllNotifications = exports.removeMedia = exports.uploadMedia = exports.deleteAccount = exports.logout = exports.resetPassword = exports.verifyOtp = exports.forgotPassword = exports.changePassword = exports.signIn = exports.signUp = exports.checkMobileNumber = exports.checkEmailAddress = exports.guestSession = void 0;
const i18n_1 = __importDefault(require("i18n"));
const stripe_1 = __importDefault(require("stripe"));
const stripe = new stripe_1.default(process.env.SECRET_KEY);
const token_1 = require("./../../../../util/token");
const model_users_1 = require("./../../../model/model.users");
const model_services_1 = require("./../../../model/model.services");
const model_communities_1 = require("./../../../model/model.communities");
const model_pets_1 = require("./../../../model/model.pets");
const model_payments_1 = require("./../../../model/model.payments");
const model_faqs_1 = require("./../../../model/model.faqs");
const model_notifications_1 = require("./../../../model/model.notifications");
const model_report_users_1 = require("./../../../model/model.report_users");
const model_guests_1 = require("./../../../model/model.guests");
const model_user_sessions_1 = require("./../../../model/model.user_sessions");
const model_user_reviews_1 = require("./../../../model/model.user_reviews");
const model_user_albums_1 = require("./../../../model/model.user_albums");
const model_email_varifications_1 = require("./../../../model/model.email_varifications");
const model_pet_likes_1 = require("./../../../model/model.pet_likes");
const model_service_likes_1 = require("./../../../model/model.service_likes");
const response_functions_1 = require("./../../../../util/response_functions");
const send_mail_1 = require("./../../../../util/send_mail");
const send_notifications_1 = require("./../../../../util/send_notifications");
const user_function_1 = require("./../../../../util/user_function");
const secure_password_1 = require("./../../../../util/secure_password");
const bucket_manager_1 = require("./../../../../util/bucket_manager");
const guestSession = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { device_token, device_type, location, address, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_guest_user = yield (0, user_function_1.findGuestUser)(device_token);
        if (find_guest_user) {
            yield model_guests_1.guests.deleteMany({ device_token });
        }
        const insert_data = {
            device_token,
            device_type,
            address,
        };
        if (location) {
            let parsed = null;
            if (typeof location === "string") {
                try {
                    parsed = JSON.parse(location);
                }
                catch (err) {
                    console.log("Error : ", err);
                    console.warn("guestSession: invalid JSON in `location`:", location);
                }
            }
            else {
                parsed = location;
            }
            if (parsed) {
                insert_data.location = parsed;
            }
        }
        yield model_guests_1.guests.create(insert_data);
        yield (0, response_functions_1.successRes)(res, res.__("Guest added successfully."), {});
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
    }
});
exports.guestSession = guestSession;
const checkEmailAddress = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email_address, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const check_email_address = yield (0, user_function_1.findEmailAddress)(email_address);
        if (check_email_address) {
            yield (0, response_functions_1.errorRes)(res, res.__("Email address already exists."));
            return;
        }
        yield (0, response_functions_1.successRes)(res, res.__("Email address available."), {});
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.checkEmailAddress = checkEmailAddress;
const checkMobileNumber = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { mobile_number, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const check_mobile_number = yield (0, user_function_1.findMobileNumber)(mobile_number);
        if (check_mobile_number) {
            yield (0, response_functions_1.errorRes)(res, res.__("Mobile number already exists."));
            return;
        }
        yield (0, response_functions_1.successRes)(res, res.__("Mobile number available."), {});
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.checkMobileNumber = checkMobileNumber;
const signUp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { full_name, email_address, country_code, country_string_code, mobile_number, is_social_login, social_id, social_platform, device_token, device_type, password, location, address, ln, } = req.body;
        i18n_1.default.setLocale(req, ln);
        const insert_data = {
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
            const hashedPassword = yield (0, secure_password_1.securePassword)(password);
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
            }
            else {
                console.warn("Invalid location data:", parsedLocation);
            }
        }
        yield model_email_varifications_1.email_verifications.create({
            email_address: email_address,
            is_email_verified: true,
        });
        const customer = yield stripe.customers.create({
            name: full_name,
            email: email_address,
        });
        if (customer) {
            insert_data.customer_id = customer.id;
        }
        const userDoc = yield model_users_1.users.create(insert_data);
        const token = yield (0, token_1.userToken)(userDoc);
        const session = yield model_user_sessions_1.user_sessions.create({
            user_id: userDoc._id.toString(),
            user_type: "user",
            device_token: device_token,
            auth_token: token,
            device_type: device_type,
            is_login: true,
            is_active: true,
        });
        yield model_guests_1.guests.deleteMany({
            device_token: device_token,
            device_type: device_type,
        });
        const res_data = Object.assign(Object.assign({}, userDoc.toObject()), { token: token, device_token: session.device_token, device_type: session.device_type, user_profile: null });
        yield (0, response_functions_1.successRes)(res, res.__("User signup successfully."), res_data);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.signUp = signUp;
const signIn = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const { email_address, full_name, device_type, device_token, password, is_social_login, social_id, social_platform, location, address, ln, } = req.body;
        i18n_1.default.setLocale(req, ln);
        const isSocial = is_social_login === true || is_social_login === "true";
        if (isSocial) {
            let find_user = null;
            if (email_address) {
                const found = yield (0, user_function_1.findSocialEmailAddress)(email_address);
                if (found && "_id" in found) {
                    find_user = found;
                }
            }
            else if (social_id) {
                const result = yield model_users_1.users.find({
                    is_social_login: true,
                    social_id,
                    is_deleted: false,
                });
                if (result.length > 0) {
                    find_user = result[0];
                }
            }
            if (find_user) {
                if (find_user.social_platform &&
                    find_user.social_platform !== social_platform) {
                    yield (0, response_functions_1.errorRes)(res, res.__("auth.email_already_used", {
                        platform: String((_a = find_user.social_platform) !== null && _a !== void 0 ? _a : ""),
                    }));
                    return;
                }
                if (find_user.is_blocked_by_admin === true) {
                    yield (0, response_functions_1.errorRes)(res, res.__("This account has been blocked. Please get in touch with the administrator."));
                    return;
                }
                const token = yield (0, token_1.userToken)(find_user);
                const session = yield model_user_sessions_1.user_sessions.create({
                    user_id: find_user._id,
                    user_type: "user",
                    device_token,
                    auth_token: token,
                    device_type,
                    is_login: true,
                    is_active: true,
                });
                yield model_guests_1.guests.deleteMany({ device_token, device_type });
                const res_data = Object.assign(Object.assign({}, find_user.toObject()), { token, device_token: session.device_token, device_type: session.device_type, user_profile: null });
                yield (0, response_functions_1.successRes)(res, res.__("User signin successfully."), res_data);
                return;
            }
            else {
                const blockedUser = yield (0, user_function_1.findSocialBlockUser)(email_address);
                if (blockedUser) {
                    yield (0, response_functions_1.errorRes)(res, res.__("This account has been blocked. Please get in touch with the administrator."));
                    return;
                }
                const insert_data = {
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
                    }
                    catch (_c) {
                        insert_data.location = {};
                    }
                }
                yield model_email_varifications_1.email_verifications.create({
                    email_address,
                    is_email_verified: true,
                });
                const customer = yield stripe.customers.create({
                    name: full_name,
                    email: email_address,
                });
                if (customer) {
                    insert_data.customer_id = customer.id;
                }
                const create_user = yield model_users_1.users.create(insert_data);
                const token = yield (0, token_1.userToken)(create_user);
                const session = yield model_user_sessions_1.user_sessions.create({
                    user_id: create_user._id,
                    user_type: "user",
                    device_token,
                    auth_token: token,
                    device_type,
                    is_login: true,
                    is_active: true,
                });
                yield model_guests_1.guests.deleteMany({ device_token, device_type });
                const res_data = Object.assign(Object.assign({}, create_user.toObject()), { token, device_token: session.device_token, device_type: session.device_type, user_profile: null });
                yield (0, response_functions_1.successRes)(res, res.__("User signin successfully."), res_data);
                return;
            }
        }
        else {
            const find_user = yield (0, user_function_1.findEmailAddress)(email_address);
            if (!find_user || !("_id" in find_user)) {
                yield (0, response_functions_1.errorRes)(res, res.__("No account was found with this email address."));
                return;
            }
            if (find_user.is_social_login === true) {
                yield (0, response_functions_1.errorRes)(res, res.__("auth.email_already_used", String((_b = find_user.social_platform) !== null && _b !== void 0 ? _b : "")));
                return;
            }
            if (typeof find_user.password !== "string") {
                yield (0, response_functions_1.errorRes)(res, res.__("Password not set for this user."));
                return;
            }
            const password_verify = yield (0, secure_password_1.comparePassword)(password || "", find_user.password);
            if (!password_verify) {
                yield (0, response_functions_1.errorRes)(res, res.__("Incorrect password. Please try again."));
                return;
            }
            if (find_user.is_blocked_by_admin === true) {
                yield (0, response_functions_1.errorRes)(res, res.__("This account has been blocked. Please get in touch with the administrator."));
                return;
            }
            const token = yield (0, token_1.userToken)(find_user);
            yield model_user_sessions_1.user_sessions.create({
                user_id: find_user._id,
                user_type: find_user.user_type,
                device_token,
                auth_token: token,
                device_type,
                is_login: true,
            });
            yield model_guests_1.guests.deleteMany({ device_token, device_type });
            const user_album = yield (0, user_function_1.findUserAlbum)(find_user._id.toString());
            const res_data = Object.assign(Object.assign({}, find_user.toObject()), { token, user_profile: user_album
                    ? `${process.env.BUCKET_URL}${user_album}`
                    : null });
            yield (0, response_functions_1.successRes)(res, res.__("Successfully logged in."), res_data);
            return;
        }
    }
    catch (error) {
        console.error("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.signIn = signIn;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user || !req.user._id) {
            yield (0, response_functions_1.errorRes)(res, "User not authenticated");
            return;
        }
        const user_id = req.user._id;
        const { old_password, new_password, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_user = yield (0, user_function_1.findUser)(user_id);
        if (!find_user || typeof find_user !== "object" || !("_id" in find_user)) {
            yield (0, response_functions_1.errorRes)(res, res.__("User not found."));
            return;
        }
        if (find_user.is_social_login === true) {
            yield (0, response_functions_1.errorRes)(res, res.__("auth.change_password", {
                platform: find_user.social_platform,
            }));
            return;
        }
        const password_verify = yield (0, secure_password_1.comparePassword)(old_password, find_user.password);
        if (!password_verify) {
            yield (0, response_functions_1.errorRes)(res, res.__("The old password is incorrect. Please try again."));
            return;
        }
        const hashedPassword = yield (0, secure_password_1.securePassword)(new_password);
        if (find_user.password === hashedPassword) {
            yield (0, response_functions_1.errorRes)(res, res.__("Your existing and new password are similar. Please try a different password."));
            return;
        }
        const update_data = {
            password: hashedPassword,
        };
        yield model_users_1.users.findByIdAndUpdate(user_id, update_data);
        yield (0, response_functions_1.successRes)(res, res.__("Your password has been changed."), []);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.changePassword = changePassword;
const forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { email_address, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_user = yield (0, user_function_1.findEmailAddress)(email_address);
        if (!find_user) {
            yield (0, response_functions_1.errorRes)(res, res.__("No account found with this email."));
            return;
        }
        if (find_user.is_social_login === true) {
            yield (0, response_functions_1.errorRes)(res, res.__("auth.forgot_password", {
                platform: String((_a = find_user.social_platform) !== null && _a !== void 0 ? _a : ""),
            }));
            return;
        }
        const otp = Math.floor(1000 + Math.random() * 9000);
        yield model_email_varifications_1.email_verifications.updateOne({
            email_address: email_address,
            is_email_verified: true,
            is_deleted: false,
        }, {
            $set: {
                otp: otp,
            },
        });
        const emailData = {
            full_name: find_user.full_name,
            emailAddress: find_user.email_address,
            otp: otp.toString(),
        };
        yield (0, send_mail_1.sendOtpForgotPassword)(emailData);
        yield (0, response_functions_1.successRes)(res, res.__("Otp sent successfully to your email."), otp);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.forgotPassword = forgotPassword;
const verifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email_address, otp, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_user = yield (0, user_function_1.findVerifyEmailAddress)(email_address);
        if (!find_user) {
            yield (0, response_functions_1.errorRes)(res, res.__("No account was found with this email address."));
            return;
        }
        if (find_user &&
            typeof find_user === "object" &&
            "otp" in find_user &&
            typeof find_user.otp === "number" &&
            find_user.otp === parseInt(otp.toString())) {
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
            yield (0, response_functions_1.successRes)(res, res.__("Code verified successfully."), []);
            return;
        }
        else {
            yield (0, response_functions_1.errorRes)(res, res.__("Please enter valid Code."));
            return;
        }
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.verifyOtp = verifyOtp;
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email_address, mobile_number, new_password, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        if (email_address) {
            const find_user = yield (0, user_function_1.findEmailAddress)(email_address);
            if (!find_user) {
                yield (0, response_functions_1.errorRes)(res, res.__("No account was found with this email address."));
                return;
            }
            const hashedPassword = yield (0, secure_password_1.securePassword)(new_password);
            const update_data = {
                password: hashedPassword,
            };
            yield model_users_1.users.updateOne({
                _id: find_user._id,
            }, {
                $set: update_data,
            });
            yield (0, response_functions_1.successRes)(res, res.__(`Your password has been updated successfully.`), []);
            return;
        }
        if (mobile_number) {
            const find_user = yield (0, user_function_1.findMobileNumber)(mobile_number);
            if (!find_user) {
                yield (0, response_functions_1.errorRes)(res, res.__("No account was found with this mobile number."));
                return;
            }
            const hashedPassword = yield (0, secure_password_1.securePassword)(new_password);
            const update_data = {
                password: hashedPassword,
            };
            if (!find_user ||
                typeof find_user !== "object" ||
                !("_id" in find_user)) {
                yield (0, response_functions_1.errorRes)(res, res.__("User not found."));
                return;
            }
            yield model_users_1.users.updateOne({ _id: find_user._id.toString() }, { $set: update_data });
            yield (0, response_functions_1.successRes)(res, res.__(`Your password has been updated successfully.`), []);
            return;
        }
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.resetPassword = resetPassword;
const logout = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { device_token, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_user = yield (0, user_function_1.findUser)(user_id);
        if (!find_user) {
            yield (0, response_functions_1.errorRes)(res, res.__("User not found."));
            return;
        }
        yield model_user_sessions_1.user_sessions.deleteMany({
            user_id: user_id,
            device_token: device_token,
        });
        yield (0, response_functions_1.successRes)(res, res.__("You have successfully logged out."), []);
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.logout = logout;
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { device_token, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_user = yield (0, user_function_1.findUser)(user_id);
        if (!find_user) {
            yield (0, response_functions_1.errorRes)(res, res.__("User not found."));
            return;
        }
        yield model_users_1.users.updateOne({ _id: user_id }, {
            $set: {
                is_deleted: true,
            },
        }, { new: true });
        // for remove pet likes by the other users
        model_pets_1.pets.find({ user_id: user_id }).then((data) => __awaiter(void 0, void 0, void 0, function* () {
            if (data.length > 0) {
                for (const pet of data) {
                    yield model_pet_likes_1.pet_likes.deleteMany({ pet_id: pet._id });
                }
            }
        }));
        // for remove services like by the other users
        model_services_1.services.find({ user_id: user_id }).then((data) => __awaiter(void 0, void 0, void 0, function* () {
            if (data.length > 0) {
                for (const service of data) {
                    yield model_service_likes_1.service_likes.deleteMany({ service_id: service._id });
                }
            }
        }));
        yield model_user_sessions_1.user_sessions.deleteMany({
            user_id: user_id,
            device_token: device_token,
        });
        yield model_user_reviews_1.user_reviews.deleteMany({ user_id: user_id });
        yield model_user_albums_1.user_albums.deleteMany({ user_id: user_id });
        yield model_services_1.services.deleteMany({ user_id: user_id });
        yield model_pets_1.pets.deleteMany({ user_id: user_id });
        yield model_communities_1.communities.deleteMany({ user_id: user_id });
        yield model_payments_1.payments.deleteMany({ user_id: user_id });
        yield model_notifications_1.notifications.deleteMany({ sender_id: user_id });
        yield (0, response_functions_1.successRes)(res, res.__("Your account is deleted successfully."), []);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.deleteAccount = deleteAccount;
const uploadMedia = (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { album_type, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        if (!req.files || !req.files.album) {
            console.log("album missing → returning 400");
            (0, response_functions_1.errorRes)(res, res.__("Album file is required."));
            return;
        }
        if (!req.files || !req.files.album) {
            (0, response_functions_1.errorRes)(res, res.__("Album file is required."));
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
        const mediaAlbum = {
            originalFilename: albumSrc.originalFilename,
            path: albumSrc.path,
            mimetype: albumSrc.type,
            data: Buffer.alloc(0),
        };
        const res_upload_file = yield (0, bucket_manager_1.uploadMediaIntoS3Bucket)(mediaAlbum, folder_name, content_type);
        if (!res_upload_file.status) {
            (0, response_functions_1.errorRes)(res, res.__("User media upload failed."));
            return;
        }
        if (thumbSrc) {
            const folder_name_thumbnail = "video_thumbnail";
            const content_type_thumbnail = thumbSrc.type;
            const mediaThumbnail = {
                originalFilename: thumbSrc.originalFilename,
                path: thumbSrc.path,
                mimetype: thumbSrc.type,
                data: Buffer.alloc(0),
            };
            const res_upload_thumbnail_file = yield (0, bucket_manager_1.uploadMediaIntoS3Bucket)(mediaThumbnail, folder_name_thumbnail, content_type_thumbnail);
            if (!res_upload_thumbnail_file.status) {
                (0, response_functions_1.errorRes)(res, res.__("User thumbnail media upload failed."));
                return;
            }
            const user_image_path = `${folder_name}/` + res_upload_file.file_name;
            const thumbnail_image_path = `${folder_name_thumbnail}/` + res_upload_thumbnail_file.file_name;
            const add_albums = yield model_user_albums_1.user_albums.create({
                user_id,
                album_type,
                album_thumbnail: thumbnail_image_path,
                album_path: user_image_path,
            });
            add_albums.album_path = process.env.BUCKET_URL + add_albums.album_path;
            add_albums.album_thumbnail =
                process.env.BUCKET_URL + add_albums.album_thumbnail;
            (0, response_functions_1.successRes)(res, res.__("User media uploaded successfully."), add_albums);
            return;
        }
        const user_image_path = `${folder_name}/` + res_upload_file.file_name;
        const add_albums = yield model_user_albums_1.user_albums.create({
            user_id,
            album_type,
            album_thumbnail: null,
            album_path: user_image_path,
        });
        add_albums.album_path = process.env.BUCKET_URL + add_albums.album_path;
        (0, response_functions_1.successRes)(res, res.__("User media uploaded successfully."), add_albums);
    }
    catch (error) {
        console.error("Error :", error);
        (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
    }
});
exports.uploadMedia = uploadMedia;
const removeMedia = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { album_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const userAlbum = yield (0, user_function_1.findAlbumById)(album_id, user_id);
        if (userAlbum &&
            typeof userAlbum === "object" &&
            "album_path" in userAlbum) {
            const res_remove_file = yield (0, bucket_manager_1.removeMediaFromS3Bucket)(userAlbum.album_path);
            if (userAlbum.album_type === "video") {
                yield (0, bucket_manager_1.removeMediaFromS3Bucket)(userAlbum.album_thumbnail);
            }
            if (res_remove_file.status) {
                yield model_user_albums_1.user_albums.deleteOne({
                    _id: album_id,
                });
                yield (0, response_functions_1.successRes)(res, res.__("Media removed successfully."), []);
                return;
            }
            else {
                yield (0, response_functions_1.errorRes)(res, res.__("Failed to remove user media."));
                return;
            }
        }
        else {
            yield (0, response_functions_1.errorRes)(res, res.__("Album not found."));
            return;
        }
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.removeMedia = removeMedia;
const deleteAllNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        yield model_notifications_1.notifications.updateMany({
            $or: [{ receiver_id: user_id }, { receiver_ids: { $in: [user_id] } }],
            is_deleted: false,
        }, { $addToSet: { deleted_by_user: user_id } });
        yield (0, response_functions_1.successRes)(res, "All notifications deleted successfully", []);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.deleteAllNotifications = deleteAllNotifications;
const notificationsList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let user_id;
        if (req.user._id) {
            user_id = req.user._id;
        }
        else {
            user_id = req.body.user_id;
        }
        const { page = 1, limit = 10, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const userObjectId = yield (0, user_function_1.objectId)(user_id);
        const notification_list = yield model_notifications_1.notifications.aggregate([
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
        const notification_list_count = yield model_notifications_1.notifications.countDocuments({
            is_deleted: false,
            deleted_by_user: { $ne: userObjectId },
            $or: [
                { receiver_id: userObjectId },
                { receiver_ids: { $in: [userObjectId] } },
            ],
        });
        yield model_users_1.users.updateOne({
            _id: userObjectId,
        }, {
            $set: {
                notification_badge: 0,
            },
        });
        yield (0, response_functions_1.multiSuccessRes)(res, res.__("Notification list get successfully."), notification_list_count, notification_list);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.notificationsList = notificationsList;
const changeFullName = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { full_name, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const result = yield model_users_1.users.updateOne({
            _id: user_id,
        }, {
            $set: {
                full_name: full_name,
            },
        });
        if (result.matchedCount === 0) {
            yield (0, response_functions_1.errorRes)(res, res.__("User not found."));
            return;
        }
        yield (0, response_functions_1.successRes)(res, res.__("Full name changed successfully."), []);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.changeFullName = changeFullName;
const checkReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { reviewed_user_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        if (user_id.toString() === reviewed_user_id.toString()) {
            yield (0, response_functions_1.errorRes)(res, res.__("You cannot review yourself."));
            return;
        }
        const existingReview = yield (0, user_function_1.findExistingReview)(user_id, reviewed_user_id);
        if (existingReview) {
            yield (0, response_functions_1.errorRes)(res, res.__("You have already reviewed this user."));
            return;
        }
        yield (0, response_functions_1.successRes)(res, res.__("You can add review."), []);
        return;
    }
    catch (error) {
        console.log("Error: ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.checkReview = checkReview;
const addReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { reviewed_user_id, rating, review, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        if (user_id.toString() === reviewed_user_id.toString()) {
            yield (0, response_functions_1.errorRes)(res, res.__("You cannot review yourself."));
            return;
        }
        const existingReview = yield (0, user_function_1.findExistingReview)(user_id, reviewed_user_id);
        if (existingReview) {
            yield (0, response_functions_1.errorRes)(res, res.__("You have already reviewed this user."));
            return;
        }
        const newReview = yield model_user_reviews_1.user_reviews.create({
            user_id,
            reviewed_user_id,
            rating,
            review,
        });
        if (newReview) {
            const otherUserObjectId = yield (0, user_function_1.objectId)(reviewed_user_id);
            const userObjectId = yield (0, user_function_1.objectId)(user_id);
            const userData = yield (0, user_function_1.findUser)(user_id);
            if (!userData ||
                typeof userData !== "object" ||
                !("full_name" in userData)) {
                yield (0, response_functions_1.errorRes)(res, res.__("User not found."));
                return;
            }
            const userAlbumData = yield (0, user_function_1.findUserAlbum)(String(userObjectId));
            const noti_msg = `"${newReview.review}" - You received a ${newReview.rating} - star review from ${userData.full_name}`;
            const noti_title = "New Review Received";
            const noti_for = "new_review";
            const noti_image = (process.env.BUCKET_URL +
                userAlbumData);
            const deviceTokenData = yield (0, user_function_1.findDeviceToken)(String(otherUserObjectId));
            const notiData = {
                noti_msg,
                noti_title,
                noti_for,
                noti_image,
                review_id: newReview._id,
                id: userObjectId,
            };
            yield model_notifications_1.notifications.create({
                sender_id: userObjectId,
                receiver_id: otherUserObjectId,
                receiver_ids: otherUserObjectId,
                noti_title: noti_title,
                noti_msg: `"review" - You received a rating - star review from full_name`,
                noti_for: noti_for,
                review_id: newReview._id,
            });
            if (Array.isArray(deviceTokenData) && deviceTokenData.length > 0) {
                (0, send_notifications_1.multiNotificationSend)(Object.assign(Object.assign({}, notiData), { device_token: deviceTokenData, id: String(userObjectId), sound_name: "default" }));
                (0, user_function_1.incNotificationBadge)(String(otherUserObjectId));
            }
        }
        yield (0, response_functions_1.successRes)(res, res.__("Review added successfully."), newReview);
        return;
    }
    catch (error) {
        console.log("Error: ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.addReview = addReview;
const editReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { review_id, rating, review, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_review = yield (0, user_function_1.findReview)(review_id);
        if (!find_review) {
            yield (0, response_functions_1.errorRes)(res, res.__("Review not found."));
            return;
        }
        const find_own_review = yield (0, user_function_1.findOwnReview)(user_id, review_id);
        if (!find_own_review) {
            yield (0, response_functions_1.errorRes)(res, res.__("You don't have permission to edit this review."));
            return;
        }
        yield model_user_reviews_1.user_reviews.updateOne({ _id: review_id }, {
            $set: {
                rating: rating,
                review: review,
            },
        });
        const updatedReview = yield (0, user_function_1.findReview)(review_id);
        yield (0, response_functions_1.successRes)(res, res.__("Review updated successfully."), updatedReview);
        return;
    }
    catch (error) {
        console.log("Error: ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.editReview = editReview;
const deleteReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { review_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_review = yield (0, user_function_1.findReview)(review_id);
        if (!find_review) {
            yield (0, response_functions_1.errorRes)(res, res.__("Review not found."));
            return;
        }
        const find_own_review = yield (0, user_function_1.findOwnReview)(user_id, review_id);
        if (!find_own_review) {
            yield (0, response_functions_1.errorRes)(res, res.__("You don't have permission to delete this review."));
            return;
        }
        yield model_user_reviews_1.user_reviews.deleteOne({ _id: review_id });
        yield model_notifications_1.notifications.deleteMany({ review_id: review_id });
        yield (0, response_functions_1.successRes)(res, res.__("Review deleted successfully."), []);
        return;
    }
    catch (error) {
        console.log("Error: ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.deleteReview = deleteReview;
const getUserReview = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reviewed_user_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const reviewObjectId = yield (0, user_function_1.objectId)(reviewed_user_id);
        const result = yield model_user_reviews_1.user_reviews.aggregate([
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
            yield (0, response_functions_1.errorRes)(res, res.__("No reviews found."));
            return;
        }
        const res_data = {
            average_rating: Number(result[0].averageRating).toFixed(1),
            total_review: result[0].totalReviews,
        };
        yield (0, response_functions_1.successRes)(res, res.__("Reviews fetched successfully."), res_data);
        return;
    }
    catch (error) {
        console.log("Error: ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.getUserReview = getUserReview;
const userReviewList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reviewed_user_id, page = 1, limit = 10, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const reviewObjectId = yield (0, user_function_1.objectId)(reviewed_user_id);
        const result = yield model_user_reviews_1.user_reviews.aggregate([
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
        const result_count = yield model_user_reviews_1.user_reviews.countDocuments({
            reviewed_user_id: reviewObjectId,
        });
        yield (0, response_functions_1.multiSuccessRes)(res, res.__("Reviews list fetched successfully."), result_count, result);
        return;
    }
    catch (error) {
        console.log("Error: ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.userReviewList = userReviewList;
const userReviewDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { reviewed_user_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const reviewObjectId = yield (0, user_function_1.objectId)(reviewed_user_id);
        const find_user = yield (0, user_function_1.findUser)(String(reviewObjectId));
        if (!find_user ||
            typeof find_user !== "object" ||
            !("_id" in find_user) ||
            !("_doc" in find_user)) {
            yield (0, response_functions_1.errorRes)(res, res.__("User not found."));
            return;
        }
        const user_album = yield (0, user_function_1.findUserAlbum)(String(find_user._id));
        const result = yield model_user_reviews_1.user_reviews.aggregate([
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
        const res_data = Object.assign(Object.assign({}, find_user._doc), { user_profile: user_album
                ? process.env.BUCKET_URL + user_album
                : null, average_rating: result.length > 0 ? Number(result[0].averageRating).toFixed(1) : "0", total_review: result.length > 0 ? result[0].totalReviews : 0 });
        yield (0, response_functions_1.successRes)(res, res.__("Reviews detail fetched successfully."), res_data);
        return;
    }
    catch (error) {
        console.log("Error: ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.userReviewDetail = userReviewDetail;
const faqListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const list_faq = yield model_faqs_1.faqs.aggregate([
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
        yield (0, response_functions_1.successRes)(res, res.__("Faq list get successfully."), list_faq);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.faqListing = faqListing;
const uploadSocketMedia = (
// eslint-disable-next-line @typescript-eslint/no-explicit-any
req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { album_type, ln } = req.body;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let { album, thumbnail } = (_a = req.files) !== null && _a !== void 0 ? _a : {};
        i18n_1.default.setLocale(req, ln);
        if (album && !Array.isArray(album))
            album = [album];
        if (thumbnail && !Array.isArray(thumbnail))
            thumbnail = [thumbnail];
        if (!album || !Array.isArray(album)) {
            (0, response_functions_1.errorRes)(res, res.__("No media files provided."));
            return;
        }
        const albumTypes = album_type ? JSON.parse(album_type) : [];
        const uploadedFiles = [];
        const folder_name = "socket_media";
        const folder_name_thumbnail = "video_thumbnail";
        for (let i = 0; i < albumTypes.length; i++) {
            const album_type_i = albumTypes[i];
            const media = album[i];
            if (!media) {
                (0, response_functions_1.errorRes)(res, res.__("Media upload failed for one of the files."));
                return;
            }
            const content_type = media.type;
            const mediaFile = {
                originalFilename: media.originalFilename,
                path: media.path,
                mimetype: media.type,
                data: Buffer.alloc(0),
            };
            const res_upload_file = yield (0, bucket_manager_1.uploadMediaIntoS3Bucket)(mediaFile, folder_name, content_type);
            if (!res_upload_file.status) {
                (0, response_functions_1.errorRes)(res, res.__("Media upload failed for one of the files."));
                return;
            }
            const file_name = res_upload_file.file_name;
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
                let thumbnail_image_path = null;
                if (thumbnail && thumbnail[i]) {
                    const thumbSrc = thumbnail[i];
                    const mediaThumb = {
                        originalFilename: thumbSrc.originalFilename,
                        path: thumbSrc.path,
                        mimetype: thumbSrc.type,
                        data: Buffer.alloc(0),
                    };
                    const res_upload_thumb = yield (0, bucket_manager_1.uploadMediaIntoS3Bucket)(mediaThumb, folder_name_thumbnail, thumbSrc.type);
                    if (!res_upload_thumb.status) {
                        (0, response_functions_1.errorRes)(res, res.__("Media upload failed for one of the files."));
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
        (0, response_functions_1.successRes)(res, res.__("All media uploaded successfully."), uploadedFiles);
    }
    catch (error) {
        console.error("Error :", error);
        (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
    }
});
exports.uploadSocketMedia = uploadSocketMedia;
const userUpdatedData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_user = yield (0, user_function_1.findUser)(user_id);
        if (!find_user ||
            typeof find_user !== "object" ||
            !("_id" in find_user) ||
            !("_doc" in find_user)) {
            yield (0, response_functions_1.errorRes)(res, res.__("User not found."));
            return;
        }
        const user_album = yield (0, user_function_1.findUserAlbum)(String(find_user._id));
        const album_id = yield (0, user_function_1.findUserAlbumId)(String(find_user._id));
        const res_data = Object.assign(Object.assign({}, find_user._doc), { user_profile: user_album
                ? process.env.BUCKET_URL + user_album
                : null, album_id: album_id });
        yield (0, response_functions_1.successRes)(res, res.__("Successfully updated user data."), res_data);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.userUpdatedData = userUpdatedData;
const userList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const usersList = yield model_users_1.users.find({
            _id: { $ne: user_id },
            user_type: "user",
            is_deleted: false,
        }, { full_name: 1, email_address: 1, _id: 1 });
        yield (0, response_functions_1.successRes)(res, res.__("User list retrieved successfully."), usersList);
        return;
    }
    catch (error) {
        console.log("Error: ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.userList = userList;
const checkReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { reported_user_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        if (user_id.toString() === reported_user_id.toString()) {
            yield (0, response_functions_1.errorRes)(res, res.__("You cannot report yourself."));
            return;
        }
        const existingReport = yield (0, user_function_1.findExistingReport)(user_id, reported_user_id);
        if (existingReport) {
            yield (0, response_functions_1.errorRes)(res, res.__("You have already reported this user."));
            return;
        }
        yield (0, response_functions_1.successRes)(res, res.__("You can add report."), {});
        return;
    }
    catch (error) {
        console.log("Error: ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.checkReport = checkReport;
const addReport = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { reported_user_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        if (user_id.toString() === reported_user_id.toString()) {
            yield (0, response_functions_1.errorRes)(res, res.__("You cannot report yourself."));
            return;
        }
        const existingReport = yield (0, user_function_1.findExistingReport)(user_id, reported_user_id);
        if (existingReport) {
            yield (0, response_functions_1.errorRes)(res, res.__("You have already reported this user."));
            return;
        }
        const newReport = yield model_report_users_1.report_users.create({ user_id, reported_user_id });
        yield (0, response_functions_1.successRes)(res, res.__("Report added successfully."), newReport);
        return;
    }
    catch (error) {
        console.log("Error: ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.addReport = addReport;
const addPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user_id = req.user._id;
        const { pet_id, payment_id, payment_method, payment_status, amount, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const existingReview = yield (0, user_function_1.findExistingPayment)(user_id, pet_id);
        if (existingReview) {
            yield (0, response_functions_1.errorRes)(res, res.__("You have already paid for this pet."));
            return;
        }
        const petIdLast5 = pet_id.slice(-5);
        const transaction_id = `${petIdLast5}`;
        const newPayment = yield model_payments_1.payments.create({
            user_id,
            pet_id,
            payment_method,
            payment_status,
            amount,
            payment_id,
            transaction_id,
        });
        if (newPayment) {
            const userObjectId = yield (0, user_function_1.objectId)(user_id);
            const find_pet = yield (0, user_function_1.findPet)(pet_id);
            const deviceTokenResult = yield (0, user_function_1.findDeviceToken)(String(userObjectId));
            const deviceTokenData = Array.isArray(deviceTokenResult)
                ? deviceTokenResult
                : [];
            if (!find_pet ||
                typeof find_pet !== "object" ||
                !("pet_name" in find_pet) ||
                !("_id" in find_pet)) {
                yield (0, response_functions_1.errorRes)(res, res.__("Pet not found."));
                return;
            }
            const noti_msg = `Your pet "${find_pet.pet_name}" is now live and visible to others!`;
            const noti_title = "Listing Published";
            const noti_for = "pet_published";
            const notiData = {
                noti_msg,
                noti_title,
                noti_for,
                device_token: deviceTokenData,
                pet_id: String(find_pet._id),
                id: String(find_pet._id),
                sound_name: "default", // required by multiNotificationSend
            };
            yield model_notifications_1.notifications.create({
                sender_id: userObjectId,
                receiver_id: userObjectId,
                noti_title,
                noti_msg,
                noti_for,
                pet_id: find_pet._id,
            });
            if (deviceTokenData.length > 0) {
                yield (0, send_notifications_1.multiNotificationSend)(notiData);
            }
        }
        yield (0, response_functions_1.successRes)(res, res.__("Payment added successfully."), newPayment);
    }
    catch (error) {
        console.log("Error: ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
    }
});
exports.addPayment = addPayment;
const paymentList = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        let user_id;
        if (req.user._id) {
            user_id = req.user._id;
        }
        else {
            user_id = req.body.user_id;
        }
        const { page = 1, limit = 10, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const userObjectId = yield (0, user_function_1.objectId)(user_id);
        const totalAmount = yield model_payments_1.payments.aggregate([
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
        const payment_list = yield model_payments_1.payments.aggregate([
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
        const payment_list_count = yield model_payments_1.payments.countDocuments({
            is_deleted: false,
            user_id: userObjectId,
        });
        yield (0, response_functions_1.countMultiSuccessRes)(res, res.__("Payment list get successfully."), payment_list_count, ((_a = totalAmount[0]) === null || _a === void 0 ? void 0 : _a.total_amount) || 0, payment_list);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.paymentList = paymentList;

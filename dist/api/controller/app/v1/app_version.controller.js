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
exports.appVersionCheck = exports.addAppVersion = void 0;
const i18n_1 = __importDefault(require("i18n"));
const model_app_versions_1 = require("./../../../model/model.app_versions");
const model_app_contents_1 = require("./../../../model/model.app_contents");
const response_functions_1 = require("./../../../../util/response_functions");
const addAppVersion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { app_version, is_maintenance, app_update_status, app_platform, app_url, api_base_url, is_live, ln, } = req.body;
        i18n_1.default.setLocale(req, ln);
        const insert_qry = yield model_app_versions_1.app_versions.create({
            app_version,
            is_maintenance,
            app_update_status,
            app_platform,
            app_url,
            api_base_url,
            is_live,
        });
        yield (0, response_functions_1.successRes)(res, res.__("App version added successfully."), insert_qry);
        return;
    }
    catch (error) {
        console.log(error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.addAppVersion = addAppVersion;
const appVersionCheck = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { app_version, app_platform, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const result = {};
        const check_version = yield model_app_versions_1.app_versions.findOne({
            app_version: app_version,
            is_live: true,
            app_platform: app_platform,
            is_deleted: false,
        });
        if (check_version) {
            if (check_version.app_version !== app_version) {
                result.is_need_update = true;
                result.is_force_update =
                    check_version.app_update_status === "is_force_update";
            }
            else {
                result.is_need_update = false;
                result.is_force_update = false;
            }
            result.is_maintenance = check_version.is_maintenance;
        }
        else {
            const fallback_version = yield model_app_versions_1.app_versions.findOne({
                is_live: true,
                app_platform: app_platform,
                is_deleted: false,
            });
            result.is_need_update = true;
            result.is_force_update =
                (fallback_version === null || fallback_version === void 0 ? void 0 : fallback_version.app_update_status) === "is_force_update";
            result.is_maintenance = (_a = fallback_version === null || fallback_version === void 0 ? void 0 : fallback_version.is_maintenance) !== null && _a !== void 0 ? _a : false;
        }
        const [find_terms_and_condition, find_privacy_policy, find_about] = yield Promise.all([
            model_app_contents_1.app_contents.findOne({
                content_type: "terms_and_condition",
                is_deleted: false,
            }),
            model_app_contents_1.app_contents.findOne({
                content_type: "privacy_policy",
                is_deleted: false,
            }),
            model_app_contents_1.app_contents.findOne({ content_type: "about", is_deleted: false }),
        ]);
        const result_data = Object.assign(Object.assign({}, result), { terms_and_condition: (_b = find_terms_and_condition === null || find_terms_and_condition === void 0 ? void 0 : find_terms_and_condition.content) !== null && _b !== void 0 ? _b : "", privacy_policy: (_c = find_privacy_policy === null || find_privacy_policy === void 0 ? void 0 : find_privacy_policy.content) !== null && _c !== void 0 ? _c : "", about: (_d = find_about === null || find_about === void 0 ? void 0 : find_about.content) !== null && _d !== void 0 ? _d : "" });
        yield (0, response_functions_1.successRes)(res, res.__("App version updated successfully."), result_data);
        return;
    }
    catch (error) {
        console.error("Error in appVersionCheck:", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.appVersionCheck = appVersionCheck;

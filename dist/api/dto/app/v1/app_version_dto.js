"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appVersionCheckDto = exports.addAppVersionDto = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addAppVersionDto = joi_1.default.object().keys({
    app_version: joi_1.default.string().allow().label("App version"),
    is_maintenance: joi_1.default.string().allow().label("Is maintenance"),
    app_update_status: joi_1.default.string().allow().label("App update status"),
    app_platform: joi_1.default.string().allow().label("App platform"),
    app_url: joi_1.default.string().allow().label("App url"),
    api_base_url: joi_1.default.string().allow().label("Api base url"),
    is_live: joi_1.default.string().allow().label("Is live"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.appVersionCheckDto = joi_1.default.object().keys({
    app_version: joi_1.default.string().allow().label("App version"),
    app_platform: joi_1.default.string().allow().label("App platform"),
    ln: joi_1.default.string().allow().label("Ln"),
});

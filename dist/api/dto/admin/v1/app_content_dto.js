"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContentDto = exports.deleteContentDto = exports.editContentDto = exports.addContentDto = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addContentDto = joi_1.default.object().keys({
    content_type: joi_1.default.string().required().label("Content type"),
    content: joi_1.default.string().allow().label("Content"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.editContentDto = joi_1.default.object().keys({
    content_id: joi_1.default.string().allow().label("Content id"),
    content_type: joi_1.default.string().allow().label("Content type"),
    content: joi_1.default.string().allow().label("Content"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.deleteContentDto = joi_1.default.object().keys({
    content_id: joi_1.default.string().allow().label("Content id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.getContentDto = joi_1.default.object().keys({
    ln: joi_1.default.string().allow().label("Ln"),
});

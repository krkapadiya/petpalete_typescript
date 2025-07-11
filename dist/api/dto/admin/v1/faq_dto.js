"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activeDeactiveFaqDto = exports.listFaqDto = exports.deleteFaqDto = exports.editFaqDto = exports.addFaqDto = void 0;
const joi_1 = __importDefault(require("joi"));
exports.addFaqDto = joi_1.default.object().keys({
    question: joi_1.default.string().allow().label("Question"),
    answer: joi_1.default.string().allow().label("Answer"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.editFaqDto = joi_1.default.object().keys({
    faq_id: joi_1.default.string().allow().label("Faq id"),
    question: joi_1.default.string().allow().label("Question"),
    answer: joi_1.default.string().allow().label("Answer"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.deleteFaqDto = joi_1.default.object().keys({
    faq_id: joi_1.default.string().allow().label("Faq id"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.listFaqDto = joi_1.default.object().keys({
    search: joi_1.default.string().allow("").label("Search"),
    page: joi_1.default.allow().label("Page"),
    limit: joi_1.default.allow().label("Limit"),
    ln: joi_1.default.string().allow().label("Ln"),
});
exports.activeDeactiveFaqDto = joi_1.default.object().keys({
    faq_id: joi_1.default.string().allow().label("Faq id"),
    is_active: joi_1.default.allow().label("Is active"),
    ln: joi_1.default.string().allow().label("Ln"),
});

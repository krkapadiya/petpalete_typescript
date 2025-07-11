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
exports.activeDeactiveFaq = exports.listFaq = exports.deleteFaq = exports.editFaq = exports.addFaq = void 0;
const i18n_1 = __importDefault(require("i18n"));
const model_faqs_1 = require("./../../../model/model.faqs");
const response_functions_1 = require("../../../../util/response_functions");
const user_function_1 = require("./../../../../util/user_function");
const addFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { question, answer, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_faq = yield (0, user_function_1.findFaqByName)(question);
        if (find_faq) {
            yield (0, response_functions_1.errorRes)(res, res.__("The FAQ already exists."));
            return;
        }
        const create_faq = yield model_faqs_1.faqs.create({
            question: question,
            answer: answer,
        });
        yield (0, response_functions_1.successRes)(res, res.__("The FAQ has been successfully added."), create_faq);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.addFaq = addFaq;
const editFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { faq_id, question, answer, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_faq = yield (0, user_function_1.findFaq)(faq_id);
        if (!find_faq) {
            yield (0, response_functions_1.errorRes)(res, res.__("The FAQ was not found."));
            return;
        }
        const find_exists_faq = yield model_faqs_1.faqs.findOne({
            _id: { $ne: faq_id },
            question: question,
        });
        if (find_exists_faq) {
            yield (0, response_functions_1.errorRes)(res, res.__("The FAQ already exists."));
            return;
        }
        yield model_faqs_1.faqs.updateOne({
            _id: faq_id,
        }, {
            $set: {
                question: question,
                answer: answer,
            },
        });
        const find_updated_faq = yield (0, user_function_1.findFaq)(faq_id);
        yield (0, response_functions_1.successRes)(res, res.__("The FAQ has been successfully updated."), find_updated_faq);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.editFaq = editFaq;
const deleteFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { faq_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_faq = yield (0, user_function_1.findFaq)(faq_id);
        if (!find_faq) {
            yield (0, response_functions_1.errorRes)(res, res.__("The FAQ was not found."));
            return;
        }
        yield model_faqs_1.faqs.deleteOne({ _id: faq_id });
        yield (0, response_functions_1.successRes)(res, res.__("The FAQ has been successfully deleted."), []);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.deleteFaq = deleteFaq;
const listFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search = "", page = 1, limit = 10, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const escapedSearch = search ? yield (0, user_function_1.escapeRegex)(search) : null;
        const list_faq = yield model_faqs_1.faqs.aggregate([
            {
                $match: search
                    ? {
                        $or: [
                            { question: { $regex: escapedSearch, $options: "i" } },
                            { answer: { $regex: escapedSearch, $options: "i" } },
                        ],
                    }
                    : {},
            },
            {
                $sort: { createdAt: -1 },
            },
            {
                $skip: (parseInt(page) - 1) * parseInt(limit),
            },
            {
                $limit: parseInt(limit),
            },
            {
                $project: {
                    _id: 1,
                    question: 1,
                    answer: 1,
                    is_active: 1,
                    createdAt: 1,
                    updatedAt: 1,
                },
            },
        ]);
        const faq_list_count = yield model_faqs_1.faqs.countDocuments(escapedSearch
            ? {
                $or: [
                    { question: { $regex: escapedSearch, $options: "i" } },
                    { answer: { $regex: escapedSearch, $options: "i" } },
                ],
            }
            : {});
        yield (0, response_functions_1.multiSuccessRes)(res, res.__("The FAQ list has been successfully retrieved."), faq_list_count, list_faq);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.listFaq = listFaq;
const activeDeactiveFaq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { faq_id, is_active, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_faq = yield (0, user_function_1.findFaq)(faq_id);
        if (!find_faq || "success" in find_faq) {
            yield (0, response_functions_1.errorRes)(res, res.__("The FAQ was not found."));
            return;
        }
        if (is_active == true || is_active == "true") {
            if (find_faq.is_active == true) {
                yield (0, response_functions_1.successRes)(res, res.__("The FAQ is already activated."), []);
                return;
            }
            else {
                yield model_faqs_1.faqs.updateOne({
                    _id: faq_id,
                }, {
                    $set: {
                        is_active: true,
                    },
                });
                yield (0, response_functions_1.successRes)(res, res.__("The FAQ has been successfully activated."), []);
                return;
            }
        }
        if (is_active == false || is_active == "false") {
            if (find_faq.is_active == false) {
                yield (0, response_functions_1.successRes)(res, res.__("The FAQ is already deactivated."), []);
                return;
            }
            else {
                yield model_faqs_1.faqs.updateOne({
                    _id: faq_id,
                }, {
                    $set: {
                        is_active: false,
                    },
                });
                yield (0, response_functions_1.successRes)(res, res.__("The FAQ has been successfully deactivated."), []);
                return;
            }
        }
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.activeDeactiveFaq = activeDeactiveFaq;

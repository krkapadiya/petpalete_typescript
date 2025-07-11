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
exports.getContent = exports.deleteContent = exports.editContent = exports.addContent = void 0;
const i18n_1 = __importDefault(require("i18n"));
const model_app_contents_1 = require("../../../model/model.app_contents");
const response_functions_1 = require("../../../../util/response_functions");
const user_function_1 = require("../../../../util/user_function");
const addContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content_type, content, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_content = yield (0, user_function_1.findContentByType)(content_type);
        if (find_content) {
            yield (0, response_functions_1.errorRes)(res, res.__("The content already exists."));
            return;
        }
        const insert_data = {
            content_type,
            content,
        };
        const create_content = yield model_app_contents_1.app_contents.create(insert_data);
        yield (0, response_functions_1.successRes)(res, res.__("The content has been successfully created."), create_content);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.addContent = addContent;
const editContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content_id, content, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_content = yield (0, user_function_1.findContent)(content_id);
        if (!find_content) {
            yield (0, response_functions_1.errorRes)(res, res.__("Content not found."));
            return;
        }
        const update_data = {
            content,
        };
        yield model_app_contents_1.app_contents.findByIdAndUpdate({
            _id: content_id,
        }, {
            $set: update_data,
        });
        const find_updated_content = yield (0, user_function_1.findContent)(content_id);
        yield (0, response_functions_1.successRes)(res, res.__("The content has been successfully updated."), find_updated_content);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.editContent = editContent;
const deleteContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { content_id, ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_content = yield (0, user_function_1.findContent)(content_id);
        if (!find_content) {
            yield (0, response_functions_1.errorRes)(res, res.__("Content not found."));
            return;
        }
        const update_data = {
            is_deleted: true,
        };
        yield model_app_contents_1.app_contents.findByIdAndUpdate({
            _id: content_id,
        }, {
            $set: update_data,
        });
        yield (0, response_functions_1.successRes)(res, res.__("The content has been successfully deleted."), []);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.deleteContent = deleteContent;
const getContent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { ln } = req.body;
        i18n_1.default.setLocale(req, ln);
        const find_content = yield model_app_contents_1.app_contents.find({
            is_deleted: false,
        });
        if (!find_content) {
            yield (0, response_functions_1.errorRes)(res, res.__("Content not found."));
            return;
        }
        yield (0, response_functions_1.successRes)(res, res.__("The content has been successfully retrieved."), find_content);
        return;
    }
    catch (error) {
        console.log("Error : ", error);
        yield (0, response_functions_1.errorRes)(res, res.__("Internal server error"));
        return;
    }
});
exports.getContent = getContent;

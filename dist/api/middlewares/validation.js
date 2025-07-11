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
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const remove_file_1 = require("./../../util/remove_file");
const response_functions_1 = require("../../util/response_functions");
const validateRequest = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b;
        try {
            const option = {
                abortEarly: false,
                errors: {
                    wrap: {
                        label: "",
                    },
                },
            };
            const { error } = yield schema.validate(req.body, option);
            if (error) {
                throw error;
            }
            next();
        }
        catch (error) {
            const { body, files } = req;
            if (Array.isArray(files)) {
                // Case when `files` is an array (multer single/multiple)
                for (const file of files) {
                    if (file.fieldname && body[file.fieldname]) {
                        (0, remove_file_1.removeFile)(body[file.fieldname]);
                    }
                }
            }
            else if (files && typeof files === "object") {
                // Case when `files` is an object (multer.fields)
                for (const field in files) {
                    if (body[field]) {
                        (0, remove_file_1.removeFile)(body[field]);
                    }
                }
            }
            const errorMsg = ((_b = (_a = error === null || error === void 0 ? void 0 : error.details) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) || "Validation failed";
            yield (0, response_functions_1.errorRes)(res, errorMsg);
        }
    });
};
exports.validateRequest = validateRequest;

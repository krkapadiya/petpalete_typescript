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
const response_functions_1 = require("./../../util/response_functions");
const validateRequest = (schema) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const option = {
                abortEarly: false,
                errors: {
                    wrap: { label: "" },
                },
            };
            const { error } = yield schema.validate(req.body, option);
            if (error)
                throw error;
            next();
        }
        catch (error) {
            const { body, files } = req;
            if (Array.isArray(files)) {
                files.forEach((file) => {
                    const fieldValue = body[file.fieldname];
                    if (fieldValue && typeof fieldValue === "string") {
                        (0, remove_file_1.removeFile)(fieldValue);
                    }
                });
            }
            const errorMsg = error instanceof Error ? error.message : "Validation failed";
            yield (0, response_functions_1.errorRes)(res, errorMsg);
        }
    });
};
exports.validateRequest = validateRequest;

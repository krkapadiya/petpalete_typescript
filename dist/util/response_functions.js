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
exports.InternalErrorRes = exports.socketErrorRes = exports.socketMultiSuccessRes = exports.socketSuccessRes = exports.webAuthFailRes = exports.maintenanceMode = exports.authFailRes = exports.errorRes = exports.manyMultiSuccessRes = exports.tokenSuccessRes = exports.countMultiSuccessRes = exports.multiSuccessRes = exports.warningRes = exports.successRes = void 0;
// ========== Express Response Handlers ==========
const successRes = (res, msg, data) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send({
        success: true,
        statuscode: 1,
        message: msg,
        data: data,
    });
});
exports.successRes = successRes;
const warningRes = (res, msg) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send({
        success: false,
        statuscode: 2,
        message: msg,
    });
});
exports.warningRes = warningRes;
const multiSuccessRes = (res, msg, total_count, data) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send({
        success: true,
        statuscode: 1,
        message: msg,
        total_number_of_data: total_count,
        data: data,
    });
});
exports.multiSuccessRes = multiSuccessRes;
const countMultiSuccessRes = (res, msg, total_count, total_amount, data) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send({
        success: true,
        statuscode: 1,
        message: msg,
        total_number_of_data: total_count,
        total_amount: total_amount,
        data: data,
    });
});
exports.countMultiSuccessRes = countMultiSuccessRes;
const tokenSuccessRes = (res, msg, token, data) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send({
        success: true,
        statuscode: 1,
        message: msg,
        token: token,
        data: data,
    });
});
exports.tokenSuccessRes = tokenSuccessRes;
const manyMultiSuccessRes = (res, msg, data, total_count, page_count) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send({
        success: true,
        statuscode: 1,
        message: msg,
        total_number_of_data: total_count,
        page_no_count: page_count,
        data: data,
    });
});
exports.manyMultiSuccessRes = manyMultiSuccessRes;
const errorRes = (res, msg) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send({
        success: false,
        statuscode: 0,
        message: msg,
    });
});
exports.errorRes = errorRes;
const authFailRes = (res, msg) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(401).json({
        success: false,
        statuscode: 101,
        message: msg,
    });
});
exports.authFailRes = authFailRes;
const maintenanceMode = (res, msg) => __awaiter(void 0, void 0, void 0, function* () {
    return res.status(503).json({
        success: false,
        statuscode: 503,
        message: msg,
    });
});
exports.maintenanceMode = maintenanceMode;
const webAuthFailRes = (res, msg) => __awaiter(void 0, void 0, void 0, function* () {
    return res.send({
        success: false,
        statuscode: 101,
        message: msg,
    });
});
exports.webAuthFailRes = webAuthFailRes;
// ========== Socket Response Handlers ==========
const socketSuccessRes = (msg, data) => __awaiter(void 0, void 0, void 0, function* () {
    return {
        success: true,
        statuscode: 1,
        message: msg,
        data: data,
    };
});
exports.socketSuccessRes = socketSuccessRes;
const socketMultiSuccessRes = (msg, total_count, data) => __awaiter(void 0, void 0, void 0, function* () {
    return {
        success: true,
        statuscode: 1,
        message: msg,
        total_number_of_data: total_count,
        data: data,
    };
});
exports.socketMultiSuccessRes = socketMultiSuccessRes;
const socketErrorRes = (msg) => __awaiter(void 0, void 0, void 0, function* () {
    return {
        success: false,
        statuscode: 0,
        message: msg,
        data: [],
    };
});
exports.socketErrorRes = socketErrorRes;
const InternalErrorRes = () => __awaiter(void 0, void 0, void 0, function* () {
    return {
        success: false,
        statuscode: 0,
        message: "Internal server error",
        data: [],
    };
});
exports.InternalErrorRes = InternalErrorRes;

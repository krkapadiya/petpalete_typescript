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
exports.decryptPassword = exports.comparePassword = exports.securePassword = void 0;
const crypto_1 = __importDefault(require("crypto"));
const algorithm = process.env.ALGORITHM || "aes-256-cbc";
// generate 16 bytes of random data
const initVector = process.env.INITVECTOR;
// secret key generate 32 bytes of random data
const securityKey = process.env.SECURITYKEY;
const securePassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const cipher = yield crypto_1.default.createCipheriv(algorithm, securityKey, initVector);
    let encryptedData = yield cipher.update(password, "utf-8", "hex");
    encryptedData += yield cipher.final("hex");
    return encryptedData;
});
exports.securePassword = securePassword;
const comparePassword = (password, dbPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const originalPwd = yield (0, exports.decryptPassword)(dbPassword);
    if (originalPwd == password) {
        return true;
    }
    else {
        return false;
    }
});
exports.comparePassword = comparePassword;
const decryptPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const decipher = crypto_1.default.createDecipheriv(algorithm, securityKey, initVector);
    let decryptedData = decipher.update(password, "hex", "utf-8");
    decryptedData += decipher.final("utf8");
    return decryptedData;
});
exports.decryptPassword = decryptPassword;

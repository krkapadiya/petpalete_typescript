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
exports.userToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userToken = (findCustomer) => __awaiter(void 0, void 0, void 0, function* () {
    if (!findCustomer || !findCustomer._id) {
        throw new Error("Invalid customer document");
    }
    const id = findCustomer._id.toString();
    const token = jsonwebtoken_1.default.sign({ id }, process.env.TOKEN_KEY, {
        expiresIn: "24h",
    });
    return token;
});
exports.userToken = userToken;

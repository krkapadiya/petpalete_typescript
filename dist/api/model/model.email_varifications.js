"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.email_verifications = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const emailVerificationSchema = new mongoose_1.Schema({
    email_address: {
        type: String,
        trim: true,
        lowercase: true,
        // validate: {
        //   validator: function (v) {
        //     return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
        //   },
        //   message: "Your email is not valid please enter the correct email",
        // },
        required: [true, "Email address is required."],
    },
    otp: {
        type: Number,
        length: [4, "OTP must be 4 digit."],
        default: null,
    },
    is_email_verified: {
        type: Boolean,
        // enum: [true, false],
        default: false, // true = verified, false = not verified
    },
    is_deleted: {
        type: Boolean,
        // enum: [true, false],
        default: false, // true = deleted, false = not deleted
    },
}, { timestamps: true, versionKey: false });
exports.email_verifications = mongoose_1.default.model("email_verifications", emailVerificationSchema);

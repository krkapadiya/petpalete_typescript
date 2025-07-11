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
exports.app_versions = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const appVersionSchema = new mongoose_1.Schema({
    app_version: {
        type: String,
        required: [true, "App version is required."],
    },
    is_maintenance: {
        type: Boolean,
        //   enum: [true, false],
        default: false,
    },
    app_update_status: {
        type: String,
        enum: ["is_force_update", "is_not_need"],
        default: "is_not_need",
    },
    app_platform: {
        type: String,
        enum: ["ios", "android"],
        required: [true, "App platform is required."],
    },
    app_url: {
        type: String,
        required: [true, "App URL is required."],
    },
    api_base_url: {
        type: String,
        required: [true, "API base URL is required."],
    },
    is_live: {
        type: Boolean,
        //   enum: [true, false],
        default: true,
    },
    is_deleted: {
        type: Boolean,
        //   enum: [true, false],
        default: false,
    },
}, {
    timestamps: true,
    versionKey: false,
});
exports.app_versions = mongoose_1.default.model("app_versions", appVersionSchema);

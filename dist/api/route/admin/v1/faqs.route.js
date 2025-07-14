"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_router = express_1.default.Router();
const connect_multiparty_1 = __importDefault(require("connect-multiparty"));
const multipartMiddleware = (0, connect_multiparty_1.default)();
const auth_1 = require("../../../middlewares/auth");
const validation_1 = require("../../../middlewares/validation");
const faq_controller_1 = require("./../../../controller/admin/v1/faq.controller");
const faq_dto_1 = require("./../../../dto/admin/v1/faq_dto");
admin_router.post("/add_faq", auth_1.userAuth, multipartMiddleware, (0, validation_1.validateRequest)(faq_dto_1.addFaqDto), faq_controller_1.addFaq);
admin_router.post("/edit_faq", auth_1.userAuth, multipartMiddleware, (0, validation_1.validateRequest)(faq_dto_1.editFaqDto), faq_controller_1.editFaq);
admin_router.post("/delete_faq", auth_1.userAuth, multipartMiddleware, (0, validation_1.validateRequest)(faq_dto_1.deleteFaqDto), faq_controller_1.deleteFaq);
admin_router.post("/list_faq", auth_1.userAuth, multipartMiddleware, (0, validation_1.validateRequest)(faq_dto_1.listFaqDto), faq_controller_1.listFaq);
admin_router.post("/active_deactive_faq", auth_1.userAuth, multipartMiddleware, (0, validation_1.validateRequest)(faq_dto_1.activeDeactiveFaqDto), faq_controller_1.activeDeactiveFaq);
exports.default = admin_router;

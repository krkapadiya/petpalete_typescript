"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
// src/api/routes/admin/v1/index.ts (or similar path)
const express_1 = __importDefault(require("express"));
const admin_router = express_1.default.Router();
// Import all route modules
const admin_route_1 = __importDefault(require("./admin.route"));
const app_content_route_1 = __importDefault(require("./app_content.route"));
// import communityDetailRoutes from "./R_community_detail";
const faqs_route_1 = __importDefault(require("./faqs.route"));
// import petDetailRoutes from "./R_pet_detail";
// import serviceDetailRoutes from "./R_service_detail";
const user_detail_route_1 = __importDefault(require("./user_detail.route"));
// Mount routes
admin_router.use("/admin", admin_route_1.default);
admin_router.use("/app_content", app_content_route_1.default);
// admin_router.use("/community_detail", communityDetailRoutes);
admin_router.use("/faq", faqs_route_1.default);
// admin_router.use("/pet_detail", petDetailRoutes);
// admin_router.use("/service_detail", serviceDetailRoutes);
admin_router.use("/user_detail", user_detail_route_1.default);
// Export the main admin router
exports.default = admin_router;

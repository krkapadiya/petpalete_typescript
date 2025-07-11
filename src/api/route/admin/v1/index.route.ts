// src/api/routes/admin/v1/index.ts (or similar path)
import express from "express";
const admin_router = express.Router();

// Import all route modules
import adminRoutes from "./admin.route";
import appContentRoutes from "./app_content.route";
import communityDetailRoutes from "./community_detail.route";
import faqRoutes from "./faqs.route";
import petDetailRoutes from "./pet_detail.route";
import serviceDetailRoutes from "./service_detail.route";
import userDetailRoutes from "./user_detail.route";

// Mount routes
admin_router.use("/admin", adminRoutes);
admin_router.use("/app_content", appContentRoutes);
admin_router.use("/community_detail", communityDetailRoutes);
admin_router.use("/faq", faqRoutes);
admin_router.use("/pet_detail", petDetailRoutes);
admin_router.use("/service_detail", serviceDetailRoutes);
admin_router.use("/user_detail", userDetailRoutes);

// Export the main admin router
export default admin_router;

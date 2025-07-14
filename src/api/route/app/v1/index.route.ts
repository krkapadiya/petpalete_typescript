import express from "express";
const app_router = express.Router();

import appVersionRoute from "./app_version.route";
import communityRoute from "./community.route";
// import userRoute from "./user.route";
import petRoute from "./pet.route";
import serviceRoute from "./service.route";

app_router.use("/app_version", appVersionRoute);
app_router.use("/community", communityRoute);
// app_router.use("/user", userRoute);
app_router.use("/pet", petRoute);
app_router.use("/service", serviceRoute);

export default app_router;

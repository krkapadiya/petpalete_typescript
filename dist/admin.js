"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/admin.ts
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
// import https from "https";
const i18n_1 = __importDefault(require("i18n"));
const dotenv_1 = __importDefault(require("dotenv"));
const response_functions_1 = require("./util/response_functions");
// Load environment variables
dotenv_1.default.config();
// Create Express app
const admin = (0, express_1.default)();
// Maintenance mode flag
const isMaintenanceMode = process.env.ADMIN_MAINTENANCE_MODE === "true";
// i18n Configuration
i18n_1.default.configure({
    locales: ["en"],
    directory: path_1.default.join(__dirname, "./localization"),
    defaultLocale: "en",
    objectNotation: true,
});
// Configure the Express app
const configureApp = (server) => {
    // Middleware: i18n init
    server.use(i18n_1.default.init);
    // Middleware: CORS
    server.use((0, cors_1.default)({
        origin: "*",
        credentials: true,
    }));
    // Middleware: body parsers
    server.use(express_1.default.json());
    server.use(express_1.default.urlencoded({ limit: "200mb", extended: true }));
    // Morgan custom token
    morgan_1.default.token("host", (req) => req.hostname);
    // Middleware: logging
    server.use((0, morgan_1.default)(":method :host :url :status :res[content-length] - :response-time ms"));
    // Middleware: custom headers and maintenance mode
    server.use((req, res, next) => {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        if (isMaintenanceMode) {
            (0, response_functions_1.maintenanceMode)(res, "The server is currently under maintenance. Please try again later.");
            return;
        }
        next();
    });
};
// Apply shared configuration
configureApp(admin);
// Start server
const ADMIN_PORT = Number(process.env.ADMIN_PORT) || 1400;
const server_admin = http_1.default.createServer(admin);
// Optional HTTPS setup (commented out)
/*
import fs from "fs";
const server_admin = https.createServer(
  {
    key: fs.readFileSync("privkey1.pem"),
    cert: fs.readFileSync("fullchain1.pem"),
  },
  admin
);
*/
// Connect to database
require("./config/database");
// Load Admin routes
const index_route_1 = __importDefault(require("./api/route/admin/v1/index.route"));
admin.use("/admin_api", index_route_1.default);
// Start listening
server_admin.listen(ADMIN_PORT, () => {
    console.log(`Admin server running on port : ${ADMIN_PORT} 🚀`);
});

// src/admin.ts
import express, { Express, Request, Response, NextFunction } from "express";
import path from "path";
import morgan from "morgan";
import cors from "cors";
import http from "http";
// import https from "https";
import i18n from "i18n";
import dotenv from "dotenv";
import { maintenanceMode } from "./util/response_functions";

// Load environment variables
dotenv.config();

// Create Express app
const admin: Express = express();

// Maintenance mode flag
const isMaintenanceMode: boolean =
  process.env.ADMIN_MAINTENANCE_MODE === "true";

// i18n Configuration
i18n.configure({
  locales: ["en"],
  directory: path.join(__dirname, "./localization"),
  defaultLocale: "en",
  objectNotation: true,
});

// Configure the Express app
const configureApp = (server: Express): void => {
  // Middleware: i18n init
  server.use(i18n.init);

  // Middleware: CORS
  server.use(
    cors({
      origin: "*",
      credentials: true,
    }),
  );

  // Middleware: body parsers
  server.use(express.json());
  server.use(express.urlencoded({ limit: "200mb", extended: true }));

  // Morgan custom token
  morgan.token("host", (req: Request) => req.hostname);

  // Middleware: logging
  server.use(
    morgan(
      ":method :host :url :status :res[content-length] - :response-time ms",
    ),
  );

  // Middleware: custom headers and maintenance mode
  server.use((req: Request, res: Response, next: NextFunction): void => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept",
    );

    if (isMaintenanceMode) {
      maintenanceMode(
        res,
        "The server is currently under maintenance. Please try again later.",
      );
      return;
    }

    next();
  });
};

// Apply shared configuration
configureApp(admin);

// Start server
const ADMIN_PORT: number = Number(process.env.ADMIN_PORT) || 1400;
const server_admin = http.createServer(admin);

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
import "./config/database";

// Load Admin routes
import adminRoutes from "./api/route/admin/v1/index.route";

admin.use("/admin_api", adminRoutes);

// Start listening
server_admin.listen(ADMIN_PORT, () => {
  console.log(`Admin server running on port : ${ADMIN_PORT} 🚀`);
});

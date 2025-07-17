import express, { Request, Response, NextFunction } from "express";
const app = express();
import path from "path";
import morgan from "morgan";
import cors from "cors";
import http from "http";
import i18n from "i18n";
import dotenv from "dotenv";
dotenv.config();
import socket from "./socket/config/socket";
import { maintenanceMode } from "./util/response_functions";

const isMaintenanceMode = process.env.SOCKET_MAINTENANCE_MODE === "true";

const configureApp = (server: express.Application) => {
  i18n.configure({
    locales: ["en"],
    directory: path.join(__dirname, "./localization"),
    defaultLocale: "en",
    objectNotation: true,
  });

  server.use(i18n.init);

  // configuration of cors
  server.use(
    cors({
      origin: "*",
      credentials: true,
    }),
  );

  //json and urlencoded
  server.use(express.json());
  server.use(express.urlencoded({ limit: "200mb", extended: true }));

  // generate custom token
  morgan.token("host", function (req: Request) {
    return req.hostname;
  });

  server.use(
    morgan(
      ":method :host :url :status :res[content-length] - :response-time ms",
    ),
  );

  server.use(function (req: Request, res: Response, next: NextFunction) {
    // Set CORS headers
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept",
    );
    // Check maintenance mode and request path
    if (isMaintenanceMode && !req.path.includes("/health")) {
      return maintenanceMode(
        res,
        "The server is currently under maintenance. Please try again later.",
      );
    }
    return next();
  });
};

// Apply shared configuration to both app and admin
configureApp(app);

const SOCKET_PORT = process.env.SOCKET_PORT || 4460;

const socketServer = http.createServer(app);

// const socketServer = https.createServer(
//   {
//     key: fs.readFileSync("privkey1.pem"),
//     cert: fs.readFileSync("fullchain1.pem"),
//   },
//   app
// );

//database file
import "./config/database";

/////////////////////////////////// Socket Routes /////////////////////////////////
const socketIo = socket.init(socketServer);
import("./socket/v1").then((module) => {
  module.default(socketIo);
});

socketServer.listen(SOCKET_PORT, () => {
  console.log(`Socket server running on port : ${SOCKET_PORT} 🚀🚀`);
});

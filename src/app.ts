import express from "express";
import { Request, Response, NextFunction } from "express";
const app = express();
import path from "path";
import morgan from "morgan";
import cors from "cors";
import http from "http";
import i18n from "i18n";
import app_router from "./api/route/app/v1/index.route";

import { maintenanceMode } from "./util/response_functions";

let isMaintenanceMode = process.env.APP_MAINTENANCE_MODE === "true";

const configureApp = (server: any) => {
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

  // Mount API routes
  server.use("/app_api", app_router);

  //json and urlencoded
  server.use(express.json());
  server.use(express.urlencoded({ limit: "200mb", extended: true }));

  // generate custom token
  morgan.token("host", function (req) {
    return (req as Request).hostname;
  });

  server.use(
    morgan(
      ":method :host :url :status :res[content-length] - :response-time ms",
    ),
  );

  server.use(function (req: Request, res: Response, next: NextFunction) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept",
    );
    if (isMaintenanceMode) {
      return maintenanceMode(
        res,
        "The server is currently under maintenance. Please try again later.",
      );
    }
    return next();
  });
};

// Apply shared configuration to app
configureApp(app);

var APP_PORT = process.env.APP_PORT || 4430;

const server = http.createServer(app);

// const server = https.createServer(
//     {
//         key: fs.readFileSync("privkey1.pem"),
//         cert: fs.readFileSync("fullchain1.pem"),
//     },
//     app
// );

//database file
import connection from "./config/database";

/////////////////////////////////// App Routes ////////////////////////////////////
/////////////////////////////////// V1 ///////////////////////////////////
app.use("/app_api", app_router);

connection.then(() => {
  server.listen(APP_PORT, () => {
    console.log(`App server running on port : ${APP_PORT} 🚀`);
  });
});

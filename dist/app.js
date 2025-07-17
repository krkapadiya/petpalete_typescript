"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const path_1 = __importDefault(require("path"));
const morgan_1 = __importDefault(require("morgan"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const i18n_1 = __importDefault(require("i18n"));
const index_route_1 = __importDefault(require("./api/route/app/v1/index.route"));
const response_functions_1 = require("./util/response_functions");
const isMaintenanceMode = process.env.APP_MAINTENANCE_MODE === "true";
const configureApp = (server) => {
    i18n_1.default.configure({
        locales: ["en"],
        directory: path_1.default.join(__dirname, "./localization"),
        defaultLocale: "en",
        objectNotation: true,
    });
    server.use(i18n_1.default.init);
    // configuration of cors
    server.use((0, cors_1.default)({
        origin: "*",
        credentials: true,
    }));
    // Mount API routes
    server.use("/app_api", index_route_1.default);
    //json and urlencoded
    server.use(express_1.default.json());
    server.use(express_1.default.urlencoded({ limit: "200mb", extended: true }));
    // generate custom token
    morgan_1.default.token("host", function (req) {
        return req.hostname;
    });
    server.use((0, morgan_1.default)(":method :host :url :status :res[content-length] - :response-time ms"));
    server.use(function (_req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        if (isMaintenanceMode) {
            return (0, response_functions_1.maintenanceMode)(res, "The server is currently under maintenance. Please try again later.");
        }
        return next();
    });
};
// Apply shared configuration to app
configureApp(app);
const APP_PORT = process.env.APP_PORT || 4430;
const server = http_1.default.createServer(app);
// const server = https.createServer(
//     {
//         key: fs.readFileSync("privkey1.pem"),
//         cert: fs.readFileSync("fullchain1.pem"),
//     },
//     app
// );
//database file
const database_1 = __importDefault(require("./config/database"));
/////////////////////////////////// App Routes ////////////////////////////////////
/////////////////////////////////// V1 ///////////////////////////////////
app.use("/app_api", index_route_1.default);
database_1.default.then(() => {
    server.listen(APP_PORT, () => {
        console.log(`App server running on port : ${APP_PORT} 🚀`);
    });
});

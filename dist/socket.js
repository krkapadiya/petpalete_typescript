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
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const socket_1 = __importDefault(require("./socket/config/socket"));
const response_functions_1 = require("./util/response_functions");
let isMaintenanceMode = process.env.SOCKET_MAINTENANCE_MODE === "true";
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
    //json and urlencoded
    server.use(express_1.default.json());
    server.use(express_1.default.urlencoded({ limit: "200mb", extended: true }));
    // generate custom token
    morgan_1.default.token("host", function (req) {
        return req.hostname;
    });
    server.use((0, morgan_1.default)(":method :host :url :status :res[content-length] - :response-time ms"));
    server.use(function (req, res, next) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        if (isMaintenanceMode) {
            return (0, response_functions_1.maintenanceMode)(res, "The server is currently under maintenance. Please try again later.");
        }
        return next();
    });
};
// Apply shared configuration to both app and admin
configureApp(app);
const SOCKET_PORT = process.env.SOCKET_PORT || 4460;
const socketServer = http_1.default.createServer(app);
// const socketServer = https.createServer(
//   {
//     key: fs.readFileSync("privkey1.pem"),
//     cert: fs.readFileSync("fullchain1.pem"),
//   },
//   app
// );
//database file
require("./config/database");
/////////////////////////////////// Socket Routes /////////////////////////////////
const socketIo = socket_1.default.init(socketServer);
Promise.resolve().then(() => __importStar(require("./socket/v1"))).then((module) => {
    module.default(socketIo);
});
socketServer.listen(SOCKET_PORT, () => {
    console.log(`Socket server running on port : ${SOCKET_PORT} 🚀🚀`);
});

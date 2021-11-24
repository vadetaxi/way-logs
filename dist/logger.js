"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./submit-patch");
const winston_1 = __importDefault(require("winston"));
const winston_cloudwatch_1 = __importDefault(require("winston-cloudwatch"));
const serialize_error_1 = __importDefault(require("serialize-error"));
const ramda_1 = __importDefault(require("ramda"));
const { log, getAllInfo } = require("./logger-patch.js");
const DEFAULT_REGION = "us-east-1";
const LEVEL = Symbol.for("level");
const SPLAT = Symbol.for("splat");
const MESSAGE = Symbol.for("msg");
const getRetention = () => {
    if (process.env.APP_ENV == "production") {
        return 90;
    }
    else if (process.env.APP_ENV == "development") {
        return 30;
    }
    else {
        return 1;
    }
};
// this is a hack, to format data and keep a consistent structure
const parseData = (item) => {
    if (item instanceof Error) {
        return serialize_error_1.default(item);
    }
    if (typeof item === "object") {
        return ramda_1.default.map((value) => value instanceof Error ? serialize_error_1.default(value) : value, item);
    }
    return item;
};
exports.createLogger = (file, config) => {
    const enableConsole = process.env.WAY_LOGS_FORCE === "true" ||
        process.env.APP_ENV !== "production";
    const formatter = (log) => {
        const level = log[LEVEL];
        const message = log[MESSAGE] || log.message;
        const [item] = log[SPLAT] || [];
        // shouldn't be here
        if (enableConsole) {
            console.log({ level, file, message, item });
        }
        const data = parseData(item);
        return { level, file, message, data };
    };
    const createGroupName = (level) => `/${config.appName}/${config.env}/${level}`.toLowerCase();
    const createTransports = (logGroupname) => new winston_cloudwatch_1.default({
        logGroupName: logGroupname,
        logStreamName() {
            return process.env.HOSTNAME || "Unknown";
        },
        //@ts-ignore
        retentionInDays: getRetention(),
        level: "debug",
        messageFormatter: formatter,
        awsAccessKeyId: config.accessKeyId,
        awsSecretKey: config.secretAccessKey,
        awsRegion: config.region || DEFAULT_REGION
    });
    const logger = winston_1.default.createLogger({
        exitOnError: false,
        transports: createTransports(createGroupName),
        exceptionHandlers: createTransports(createGroupName("exceptions"))
    });
    logger.log = log;
    logger.exceptions.getAllInfo = getAllInfo;
    return logger;
};

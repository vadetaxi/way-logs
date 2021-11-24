import "./submit-patch";
import { Config } from "./interfaces";
import winston from "winston";
import WinstonCloudWatch from "winston-cloudwatch";
import serializeError from "serialize-error";
import R from "ramda";

const { log, getAllInfo } = require("./logger-patch.js");

const DEFAULT_REGION = "us-east-1";

const LEVEL = Symbol.for("level");
const SPLAT = Symbol.for("splat");
const MESSAGE = Symbol.for("msg");

const getRetention = () => {
  if (process.env.APP_ENV == "production") {
    return 90;
  } else if (process.env.APP_ENV == "development") {
    return 30;
  } else {
    return 1;
  }
};
// this is a hack, to format data and keep a consistent structure
const parseData = (item: any) => {
  if (item instanceof Error) {
    return serializeError(item);
  }
  if (typeof item === "object") {
    return R.map(
      (value: unknown) =>
        value instanceof Error ? serializeError(value) : value,
      item
    );
  }
  return item;
};
export const createLogger = (file: string, config: Config) => {
  const enableConsole =
    process.env.WAY_LOGS_FORCE === "true" ||
    process.env.APP_ENV !== "production";

  const formatter: any = (log: any) => {
    const level: string = log[LEVEL];
    const message = log[MESSAGE] || log.message;
    const [item]: any = log[SPLAT] || [];

    // shouldn't be here
    if (enableConsole) {
      console.log({ level, file, message, item });
    }

    const data = parseData(item);
    return { level, file, message, data };
  };
  const createGroupName = (level: string) =>
    `/${config.appName}/${config.env}/${level}`.toLowerCase();
  const createTransports = (logGroupname: typeof createGroupName | string) =>
    new WinstonCloudWatch({
      logGroupName: logGroupname as any,
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
  const logger = winston.createLogger({
    exitOnError: false,
    transports: createTransports(createGroupName),
    exceptionHandlers: createTransports(createGroupName("exceptions"))
  });
  logger.log = log;
  logger.exceptions.getAllInfo = getAllInfo;
  return logger;
};

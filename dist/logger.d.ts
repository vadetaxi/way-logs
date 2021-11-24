import "./submit-patch";
import { Config } from "./interfaces";
import winston from "winston";
export declare const createLogger: (file: string, config: Config) => winston.Logger;

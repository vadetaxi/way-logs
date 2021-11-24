import { Config } from "./interfaces";
import winston from "winston";
declare const _default: winston.Logger;
export default _default;
export declare const register: (config: Config) => winston.Logger;

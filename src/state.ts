import { Config } from "./interfaces";

let _config: Config;

export const get = () => _config;
export const set = (config: Config) => (_config = config);

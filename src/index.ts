delete require.cache[__filename];

import * as state from "./state";
import { createLogger } from "./logger";
import { Config } from "./interfaces";
import winston from "winston";

const { filename } = module.parent as NodeModule;
const config = state.get();

const logger = config ? createLogger(filename, config) : undefined;
export default logger as winston.Logger;
export const register = (config: Config) => {
  state.set(config);
  return createLogger(filename, config);
};

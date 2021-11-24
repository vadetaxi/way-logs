"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
delete require.cache[__filename];
const state = __importStar(require("./state"));
const logger_1 = require("./logger");
const { filename } = module.parent;
const config = state.get();
const logger = config ? logger_1.createLogger(filename, config) : undefined;
exports.default = logger;
exports.register = (config) => {
    state.set(config);
    return logger_1.createLogger(filename, config);
};

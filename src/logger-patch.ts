import winston from "winston";

const LEVEL = Symbol.for("level");
const SPLAT = Symbol.for("splat");
const MESSAGE = Symbol.for("msg"); // message would cause conflict
const formatRegExp = /%[scdjifoO%]/g;

// this piece of code was extracted from winston/logger.js
const log: any = function(
  this: any,
  level: any,
  msg: any,
  ...splat: any
): winston.Logger {
  // eslint-disable-line max-params
  // Optimize for the hotpath of logging JSON literals
  if (arguments.length === 1) {
    // Yo dawg, I heard you like levels ... seriously ...
    // In this context the LHS `level` here is actually the `info` so read
    // this as: info[LEVEL] = info.level;
    level[LEVEL] = level.level;
    this._addDefaultMeta(level);
    this.write(level);
    return this;
  }

  // Slightly less hotpath, but worth optimizing for.
  if (arguments.length === 2) {
    if (msg && typeof msg === "object") {
      msg[LEVEL] = msg.level = level;
      this._addDefaultMeta(msg);
      this.write(msg);
      return this;
    }

    this.write({ [LEVEL]: level, [MESSAGE]: msg, level, message: msg });
    return this;
  }

  const [meta] = splat;
  if (typeof meta === "object" && meta !== null) {
    // Extract tokens, if none available default to empty array to
    // ensure consistancy in expected results
    const tokens = msg && msg.match && msg.match(formatRegExp);

    if (!tokens) {
      const info = Object.assign({}, this.defaultMeta, meta, {
        [LEVEL]: level,
        [SPLAT]: splat,
        [MESSAGE]: msg,
        level,
        message: msg
      });

      if (meta.message) info.message += `${meta.message}`;
      if (meta.stack) info.stack = meta.stack;

      this.write(info);
      return this;
    }
  }

  this.write(
    Object.assign({}, this.defaultMeta, {
      [LEVEL]: level,
      [SPLAT]: splat,
      [MESSAGE]: msg,
      level,
      message: msg
    })
  );

  return this;
};
const getAllInfo: any = (err: any) => {
  let { message } = err;
  if (!message && typeof err === "string") {
    message = err;
  }
  return {
    error: err,
    // TODO (indexzero): how do we configure this?
    level: "error",
    [LEVEL]: "error",
    [SPLAT]: [err],
    // WARNING: if you change this field it will not log out
    message: "uncaughtException: a",
    [MESSAGE]: "uncaughtException",
    stack: err.stack,
    exception: true,
    date: new Date().toString()
  };
};
module.exports = { log, getAllInfo };

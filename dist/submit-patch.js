"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ramda_1 = __importDefault(require("ramda"));
const cloudWatchIntegration = require("winston-cloudwatch/lib/cloudwatch-integration");
const WinstonCloudWatch = require("winston-cloudwatch");
const stringify = require("fast-safe-stringify");
/*
  this is a bunch of hacks,
  here it replace the submit function, why?
  because we need to filter it by level
*/
const createLogs = (removeFrom, group) => {
    const logEvents = group.map((log) => (Object.assign({}, log, { message: stringify(log.message) })));
    // cloudWatchIntegration.upload calls it
    logEvents.splice = (start, del) => {
        group.slice(start, del).forEach(removeFrom);
        return logEvents.slice(start, del);
    };
    return logEvents;
};
// extracted from winston-cloudwatch/index.js
const submit = function (callback) {
    const retentionInDays = this.retentionInDays;
    if (this.logEvents.length === 0) {
        return callback();
    }
    const groups = ramda_1.default.groupBy((log) => log.message.level, this.logEvents);
    for (let level in groups) {
        const groupName = typeof this.logGroupName === "function"
            ? this.logGroupName(level)
            : this.logGroupName;
        const streamName = typeof this.logStreamName === "function"
            ? this.logStreamName(level)
            : this.logStreamName;
        const group = groups[level];
        const logs = createLogs((item) => {
            const index = this.logEvents.indexOf(item);
            this.logEvents.splice(index, 1);
        }, group);
        cloudWatchIntegration.upload(this.cloudwatchlogs, groupName, streamName, logs, retentionInDays, callback);
    }
};
WinstonCloudWatch.prototype.submit = submit;

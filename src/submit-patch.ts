import R from "ramda";

const cloudWatchIntegration = require("winston-cloudwatch/lib/cloudwatch-integration");
const WinstonCloudWatch = require("winston-cloudwatch");
const stringify = require("fast-safe-stringify");

/*
  this is a bunch of hacks,
  here it replace the submit function, why?
  because we need to filter it by level
*/
const createLogs = (removeFrom: any, group: any) => {
  const logEvents = group.map((log: any) => ({
    ...log,
    message: stringify(log.message)
  }));
  // cloudWatchIntegration.upload calls it
  logEvents.splice = (start: any, del: any) => {
    group.slice(start, del).forEach(removeFrom);
    return logEvents.slice(start, del);
  };
  return logEvents;
};

// extracted from winston-cloudwatch/index.js
const submit = function(this: any, callback: any) {
  const retentionInDays = this.retentionInDays;

  if (this.logEvents.length === 0) {
    return callback();
  }
  const groups = R.groupBy((log: any) => log.message.level, this.logEvents);

  for (let level in groups) {
    const groupName =
      typeof this.logGroupName === "function"
        ? this.logGroupName(level)
        : this.logGroupName;
    const streamName =
      typeof this.logStreamName === "function"
        ? this.logStreamName(level)
        : this.logStreamName;
    const group = groups[level];

    const logs = createLogs((item: any) => {
      const index = this.logEvents.indexOf(item);
      this.logEvents.splice(index, 1);
    }, group);

    cloudWatchIntegration.upload(
      this.cloudwatchlogs,
      groupName,
      streamName,
      logs,
      retentionInDays,
      callback
    );
  }
};
WinstonCloudWatch.prototype.submit = submit;

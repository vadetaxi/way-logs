# way-logs

## Install

```sh
npm install -S git+https://dev-vdt:senhadogitdodev-vdt@github.com/dev-vdt/logs
```

## Setup

This need to be done just one time

```javascript
// probably on app.ts
import { register } from "way-logs";

const logger = register({
  appName: "group_name_on_cloudwatch",
  accessKeyId: "aws_access_key",
  secretAccessKey: "aws_secret_key"
  // also support region, don't use it
});
```

## Usage

```javascript
// someController.js
import logger from "way-logs";

export const remove = async req => {
  const { key } = req.body;
  try {
    await db.remove(key);
    logger.info("item removed", { key });
  } catch (error) {
    logger.error("remove fail", { error, body });
  }
};
```

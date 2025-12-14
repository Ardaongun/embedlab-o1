import pino from "pino";
import { CONFIGS } from "../config/config.js";

const logger = pino({
  level: CONFIGS.LOG_LEVEL || "info",

  timestamp: pino.stdTimeFunctions.isoTime,

  redact: {
    paths: [
      "req.headers.authorization",
      "req.body.password",
      "req.body.creditCard",
      "user.email",
    ],
    remove: true,
  },

  transport: {
    targets: [
      ...(CONFIGS.NodeEnv === "development"
        ? [
            {
              target: "pino-pretty",
              options: {
                colorize: true,
                translateTime: "SYS:standard",
                ignore: "pid,hostname",
              },
            },
          ]
        : []),

      ...(CONFIGS.LOGTAIL_SOURCE_TOKEN
        ? [
            {
              target: "@logtail/pino",
              options: {
                sourceToken: CONFIGS.LOGTAIL_SOURCE_TOKEN,
                options: {
                  endpoint: CONFIGS.LOGTAIL_URL,
                },
              },
            },
          ]
        : []),

      ...(CONFIGS.NodeEnv !== "development" &&
      !CONFIGS.LOGTAIL_SOURCE_TOKEN
        ? [{ target: "pino/file", options: { destination: 1 } }] // 1 = stdout
        : []),
    ],
  },
});

export default logger;

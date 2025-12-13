import pino from "pino";

const logger = pino({
  level: process.env.LOG_LEVEL || "info",

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

  transport:
    process.env.NODE_ENV !== "prod"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

export default logger;

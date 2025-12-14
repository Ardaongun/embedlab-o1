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

  transport: {
    targets: [
      ...(process.env.NODE_ENV === "development"
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

      ...(process.env.LOGTAIL_SOURCE_TOKEN
        ? [
            {
              target: "@logtail/pino",
              options: {
                sourceToken: process.env.LOGTAIL_SOURCE_TOKEN,
                options: {
                  endpoint: process.env.LOGTAIL_URL,
                },
              },
            },
          ]
        : []),

      ...(process.env.NODE_ENV !== "development" &&
      !process.env.LOGTAIL_SOURCE_TOKEN
        ? [{ target: "pino/file", options: { destination: 1 } }] // 1 = stdout
        : []),
    ],
  },
});

export default logger;

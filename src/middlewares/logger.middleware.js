import pinoHttp from "pino-http";
import logger from "../utils/logger.js";

export const loggerMiddleware = pinoHttp({
  logger: logger,

  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url,
      query: req.query,
      params: req.params,
      remoteAddress: req.remoteAddress,
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  autoLogging: {
    ignore: (req) => req.url === "/health" || req.url === "/favicon.ico",
  },
});

import "dotenv/config";
import express from "express";
import { connectDB } from "./config/database.config.js";
import { CONFIGS } from "./config/config.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { errorHandlerMiddleware } from "./middlewares/errorHandler.middleware.js";
import { authenticateMiddleware } from "./middlewares/authenticate.middleware.js";
import pinoHttp from "pino-http";
import logger from "./utils/logger.js";

const app = express();

app.use(cors());
app.use(cookieParser());

app.use(
  pinoHttp({
    logger: logger,

    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url,
        query: req.query,
        params: req.params,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      }),
    },
    autoLogging: {
      ignore: (req) => req.url === "/health",
    },
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//authentication
app.use(authenticateMiddleware);

app.use("/api", routes);

app.use(errorHandlerMiddleware);

const PORT = CONFIGS.Port || 3000;

const startServer = async () => {
  await connectDB();
  logger.info("Database connection established successfully.");
  app.listen(PORT, () => {
    logger.info(`Server is running on port ${PORT}`);
  });
};

startServer();

export default app;

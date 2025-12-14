import "dotenv/config";
import express from "express";
import { connectDB } from "./config/database.config.js";
import { CONFIGS } from "./config/config.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { errorHandlerMiddleware } from "./middlewares/errorHandler.middleware.js";
import { authenticateMiddleware } from "./middlewares/authenticate.middleware.js";
import logger from "./utils/logger.js";
import { loggerMiddleware } from "./middlewares/logger.middleware.js";
import { contextMiddleware } from "./middlewares/context.middleware.js";
import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

const app = express();

const isProduction = CONFIGS.NodeEnv === "production";

Sentry.init({
  dsn: CONFIGS.SENTRY_DSN,
  integrations: [
    Sentry.httpIntegration(),
    Sentry.expressIntegration({ app }),
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: isProduction ? 0.1 : 1.0,
  profilesSampleRate: isProduction ? 0.5 : 1.0,
});

app.use(cors());
app.use(cookieParser());

app.use(loggerMiddleware);
app.use(contextMiddleware);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//authentication
app.use(authenticateMiddleware);

app.use("/api", routes);

Sentry.setupExpressErrorHandler(app);

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

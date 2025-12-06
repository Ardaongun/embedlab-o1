import "dotenv/config";
import express from "express";
import { connectDB } from "./config/database.config.js";
import { CONFIGS } from "./config/config.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import routes from "./routes/index.js";
import { errorHandlerMiddleware } from "./middlewares/errorHandler.middleware.js";
import { authenticateMiddleware } from "./middlewares/authenticate.middleware.js";

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//authentication
app.use(authenticateMiddleware);

app.use("/api", routes);

app.use(errorHandlerMiddleware);

const PORT = CONFIGS.Port || 3000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

startServer();

export default app;

import ApiError from "./apiError.js";
import logger from "./logger.js";

// Helper to determine which logger to use
const getLogger = (args) => {
  const [req] = args;
  if (req && req.log && typeof req.log.error === "function") {
    return req.log;
  }
  return logger;
};

const handleError = (error, logInstance) => {
  if (error instanceof ApiError) {
    throw error;
  }

  logInstance.error({ err: error }, "Unexpected execution error occurred.");
  throw ApiError.internalServerError("An unexpected error occurred");
};

export const withErrorHandling =
  (fn) =>
  async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      const currentLogger = getLogger(args);
      handleError(error);
    }
  };

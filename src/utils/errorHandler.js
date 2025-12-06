import ApiError from "./apiError.js";

const handleError = (error) => {
  if (error instanceof ApiError) {
    throw error;
  }

  // Unhandled Error
  console.error("Error occurred:", error);
  throw ApiError.internalServerError("An unexpected error occurred");
};

export const withErrorHandling =
  (fn) =>
  async (...args) => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error);
    }
  };

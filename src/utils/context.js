import { AsyncLocalStorage } from "node:async_hooks";
import logger from "./logger.js";

export const context = new AsyncLocalStorage();

export const getLogger = () => {
  const store = context.getStore();
  return store ? store.get("logger") : logger;
};

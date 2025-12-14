import { context } from "../utils/context.js";

export const contextMiddleware = (req, res, next) => {
  const store = new Map();
  store.set("logger", req.log);
  context.run(store, () => {
    next();
  });
};

import { verifyAccessToken } from "../helpers/token.helper.js";

export const authenticateMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
  } catch (err) {
    req.user = null;
  }

  next();
};

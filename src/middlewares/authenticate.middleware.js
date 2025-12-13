import { verifyAccessToken } from "../helpers/token.helper.js";

export const authenticateMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader) {
    req.log.debug(
      "Authorization header missing, proceeding as anonymous user."
    );
    req.user = null;
    return next();
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    req.log.warn("Malformed Authorization header detected.");
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    req.log.info(
      { userId: decoded._id || decoded.id },
      "User successfully authenticated."
    );
  } catch (err) {
    req.log.warn({ err }, "Token verification failed.");

    req.user = null;
  }

  next();
};

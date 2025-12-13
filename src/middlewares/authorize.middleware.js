import Response from "../utils/response.js";

export const authorizeMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      req.log.warn(
        "Authorization failed: User context missing (User not authenticated)."
      );
      return Response.unauthorized().send(res);
    }

    if (allowedRoles.length === 0) {
      return next();
    }

    if (!allowedRoles.includes(req.user.role)) {
      req.log.warn(
        {
          userRole: req.user.role,
          requiredRoles: allowedRoles,
          userId: req.userId || req.user.email,
        },
        "Access forbidden: Insufficient permissions."
      );
      return Response.forbidden(
        "Access forbidden: insufficient permissions"
      ).send(res);
    }

    req.log.debug("User authorized for protected resource.");
    next();
  };
};

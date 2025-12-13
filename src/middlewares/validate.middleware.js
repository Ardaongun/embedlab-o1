import Response from "../utils/response.js";

export const validateRequest = (schema) => {
  return (req, res, next) => {
    const toValidate = [
      { key: "body", data: req.body, validator: schema.body },
      { key: "query", data: req.query, validator: schema.query },
      { key: "params", data: req.params, validator: schema.params },
    ];

    const errors = [];

    req.validated = {};

    for (const item of toValidate) {
      if (item.validator) {
        const { error, value } = item.validator.validate(item.data, {
          abortEarly: false,
          allowUnknown: false,
        });

        if (error) {
          error.details.forEach((detail) => {
            errors.push(`${item.key}: ${detail.message}`);
          });
        } else {
          req.validated[item.key] = value;
        }
      }
    }

    if (errors.length > 0) {
      return Response.badRequest("Invalid request data", errors).send(res);
    }

    next();
  };
};

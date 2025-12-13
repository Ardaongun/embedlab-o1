import Joi from "joi";

export const createOrganizationSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(1).max(100).required().messages({
      "any.required": "Organization name is required.",
      "string.base": "Organization name must be a string.",
      "string.empty": "Organization name cannot be empty.",
      "string.min": "Organization name cannot be empty.",
      "string.max": "Organization name cannot exceed 100 characters.",
    }),
  }),
};

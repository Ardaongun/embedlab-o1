import Joi from "joi";

export const createTagSchema = {
  body: Joi.object({
    name: Joi.string().trim().min(1).max(50).required().messages({
      "any.required": "Tag name is required.",
      "string.base": "Tag name must be a string.",
      "string.empty": "Tag name cannot be empty.",
      "string.min": "Tag name cannot be empty.",
      "string.max": "Tag name cannot exceed 50 characters.",
    }),
  }),
};

export const updateTagSchema = {
  params: Joi.object({
    tagId: Joi.string().required().messages({
      "any.required": "Tag ID is required.",
      "string.base": "Tag ID must be a string.",
      "string.empty": "Tag ID cannot be empty.",
    }),
  }),

  body: Joi.object({
    name: Joi.string().trim().min(1).max(50).required().messages({
      "any.required": "Tag name is required.",
      "string.base": "Tag name must be a string.",
      "string.empty": "Tag name cannot be empty.",
      "string.min": "Tag name cannot be empty.",
      "string.max": "Tag name cannot exceed 50 characters.",
    }),
  }),
};

export const deleteTagSchema = {
  params: Joi.object({
    tagId: Joi.string().required().messages({
      "any.required": "Tag ID is required.",
      "string.base": "Tag ID must be a string.",
      "string.empty": "Tag ID cannot be empty.",
    }),
  }),
};

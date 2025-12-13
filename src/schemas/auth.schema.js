import Joi from "joi";

export const adminLoginSchema = {
  body: Joi.object({
    username: Joi.string().min(3).max(100).required().messages({
      "any.required": "Username is required.",
      "string.base": "Username must be a string.",
      "string.empty": "Username cannot be empty.",
      "string.min": "Username must be at least 3 characters.",
      "string.max": "Username cannot exceed 100 characters.",
    }),

    password: Joi.string().min(6).max(128).required().messages({
      "any.required": "Password is required.",
      "string.base": "Password must be a string.",
      "string.empty": "Password cannot be empty.",
      "string.min": "Password must be at least 6 characters.",
      "string.max": "Password cannot exceed 128 characters.",
    }),
  }),
};

export const registerOrganizationSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required.",
      "string.base": "Email must be a string.",
      "string.email": "Email must be a valid email address.",
      "string.empty": "Email cannot be empty.",
    }),

    password: Joi.string().min(6).max(128).required().messages({
      "any.required": "Password is required.",
      "string.base": "Password must be a string.",
      "string.empty": "Password cannot be empty.",
      "string.min": "Password must be at least 6 characters.",
      "string.max": "Password cannot exceed 128 characters.",
    }),

    organizationId: Joi.string().min(3).max(100).required().messages({
      "any.required": "organizationId is required.",
      "string.base": "organizationId must be a string.",
      "string.empty": "organizationId cannot be empty.",
      "string.min": "organizationId must be at least 3 characters.",
      "string.max": "organizationId cannot exceed 100 characters.",
    }),
  }),
};

export const loginSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required.",
      "string.base": "Email must be a string.",
      "string.email": "Email must be a valid email address.",
      "string.empty": "Email cannot be empty.",
    }),

    password: Joi.string().min(6).max(128).required().messages({
      "any.required": "Password is required.",
      "string.base": "Password must be a string.",
      "string.empty": "Password cannot be empty.",
      "string.min": "Password must be at least 6 characters.",
      "string.max": "Password cannot exceed 128 characters.",
    }),
  }),
};

export const refreshTokenSchema = {
  body: Joi.object({
    refreshToken: Joi.string().required().messages({
      "any.required": "Refresh token is required.",
      "string.base": "Refresh token must be a string.",
      "string.empty": "Refresh token cannot be empty.",
    }),
  }),
};

export const registerSchema = {
  body: Joi.object({
    email: Joi.string().email().required().messages({
      "any.required": "Email is required.",
      "string.base": "Email must be a string.",
      "string.email": "Email must be a valid email address.",
      "string.empty": "Email cannot be empty.",
    }),

    password: Joi.string().min(6).max(128).required().messages({
      "any.required": "Password is required.",
      "string.base": "Password must be a string.",
      "string.empty": "Password cannot be empty.",
      "string.min": "Password must be at least 6 characters.",
      "string.max": "Password cannot exceed 128 characters.",
    }),

    organizationId: Joi.string().min(3).max(100).required().messages({
      "any.required": "organizationId is required.",
      "string.base": "organizationId must be a string.",
      "string.empty": "organizationId cannot be empty.",
      "string.min": "organizationId must be at least 3 characters.",
      "string.max": "organizationId cannot exceed 100 characters.",
    }),
  }),
};

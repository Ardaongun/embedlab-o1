import Joi from "joi";

export const getItemsQuerySchema = {
  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),

    limit: Joi.number().integer().min(1).max(50).default(10),

    tags: Joi.alternatives()
      .try(Joi.array().items(Joi.string()), Joi.string())
      .optional()
      .custom((value) => {
        if (typeof value === "string") return [value]; // tek tag => array
        return value;
      }),

    searchTerm: Joi.string().optional(),

    sort: Joi.string().valid("newest", "oldest", "a-z", "z-a").optional(),

    onlyOwn: Joi.boolean().truthy("true").falsy("false").optional(),
  }),
};

export const getItemByIdSchema = {
  params: Joi.object({
    itemId: Joi.string().required().messages({
      "any.required": "itemId is required.",
      "string.base": "itemId must be a valid string.",
    }),
  }),
};

export const addItemSchema = {
  body: Joi.object({
    name: Joi.string().required().messages({
      "any.required": "Name is required.",
      "string.base": "Name must be a string.",
    }),

    description: Joi.string().required().messages({
      "any.required": "Description is required.",
      "string.base": "Description must be a string.",
    }),

    value: Joi.number().optional().default(0).messages({
      "number.base": "Value must be a number.",
    }),

    tags: Joi.array().items(Joi.string()).required().messages({
      "any.required": "Tags field is required.",
      "array.base": "Tags must be an array.",
      "string.base": "Each tag must be a string.",
    }),
  }),
};

export const addItemPhotoSchema = {
  body: Joi.object({
    itemId: Joi.string().required().messages({
      "any.required": "itemId is required.",
      "string.base": "itemId must be a string.",
    }),
  }),
};

export const updateItemByIdSchema = {
  params: Joi.object({
    itemId: Joi.string().required().messages({
      "any.required": "itemId is required.",
      "string.base": "itemId must be a string.",
    }),
  }),

  body: Joi.object({
    name: Joi.string().optional(),

    description: Joi.string().optional(),

    value: Joi.number().optional().messages({
      "number.base": "Value must be a number.",
    }),

    tags: Joi.array().items(Joi.string()).optional().messages({
      "array.base": "Tags must be an array.",
      "string.base": "Each tag must be a string.",
    }),
  }).min(1),
};

export const deleteItemPhotoSchema = {
  params: Joi.object({
    photoId: Joi.string().required().messages({
      "any.required": "photoId is required.",
      "string.base": "photoId must be a string.",
    }),
  }),

  body: Joi.object({
    itemId: Joi.string().required().messages({
      "any.required": "itemId is required.",
      "string.base": "itemId must be a string.",
    }),
  }),
};

export const deleteItemByIdSchema = {
  params: Joi.object({
    itemId: Joi.string().required().messages({
      "any.required": "itemId is required.",
      "string.base": "itemId must be a string.",
    }),
  }),
};

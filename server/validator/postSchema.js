import Joi from "joi";

const postSchema = Joi.object({
  title: Joi.string().min(5).max(100).required().messages({
    "string.min": "Title must be at least 5 characters long",
    "string.max": "Title cannot be longer than 100 characters",
    "any.required": "Title is required",
  }),

  content: Joi.string().min(20).max(2000).required().messages({
    "string.min": "Content must be at least 20 characters long",
    "string.max": "Content cannot be longer than 2000 characters",
    "any.required": "Content is required",
  }),

  image: Joi.string().optional().uri().messages({
    "string.uri": "Image URL must be a valid URI",
  }),
});

export default postSchema;

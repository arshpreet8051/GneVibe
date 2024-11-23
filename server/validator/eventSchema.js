import Joi from "joi";

const eventSchema = Joi.object({
  name: Joi.string().min(3).max(100).required().messages({
    "string.min": "Event name must be at least 3 characters long.",
    "string.max": "Event name cannot be longer than 100 characters.",
    "any.required": "Event name is required.",
  }),

  description: Joi.string().min(10).max(1000).required().messages({
    "string.min": "Description must be at least 10 characters long.",
    "string.max": "Description cannot be longer than 1000 characters.",
    "any.required": "Description is required.",
  }),

  eventDate: Joi.date().iso().min("now").required().messages({
    "date.base": "Event date must be a valid date.",
    "date.iso": "Event date must be in ISO 8601 format.",
    "date.min": "Event date must be in the future.",
    "any.required": "Event date is required.",
  }),
});

export default eventSchema;

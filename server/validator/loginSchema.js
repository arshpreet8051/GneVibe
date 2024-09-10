import Joi from "joi";

const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(/@gndec\.ac\.in$/, { name: "college email" })
    .required()
    .messages({
      "any.required": "Email is required",
      "string.email": "Email must be a valid email address",
      "string.pattern.name":
        "Email must be a valid college email (@gndec.ac.in)",
    }),

  password: Joi.string()
    .min(6)
    .pattern(new RegExp("(?=.*[A-Z])")) // At least one uppercase letter
    .pattern(new RegExp("(?=.*[!@#$%^&*])")) // At least one special character
    .required()
    .messages({
      "any.required": "Password is required",
      "string.min": "Password must be at least 6 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter and one special character",
    }),
});

export default loginSchema;

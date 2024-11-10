import Joi from "joi";

const currentYear = new Date().getFullYear();
const minYear = currentYear - 4;

const updateUserSchema = Joi.object({
  name: Joi.string().optional().messages({
    "any.required": "Name is required",
  }),

  email: Joi.string()
    .email({ tlds: { allow: false } })
    .pattern(/@gndec\.ac\.in$/, { name: "college email" })
    .optional()
    .messages({
      "string.email": "Email must be a valid email address",
      "string.pattern.name":
        "Email must be a valid college email (@gndec.ac.in)",
    }),

  password: Joi.string()
    .min(6)
    .pattern(new RegExp("(?=.*[A-Z])")) // At least one uppercase letter
    .pattern(new RegExp("(?=.*[!@#$%^&*])")) // At least one special character
    .optional()
    .messages({
      "string.min": "Password must be at least 6 characters long",
      "string.pattern.base":
        "Password must contain at least one uppercase letter and one special character",
    }),

  // New fields for academics that may come top-level in the form
  urn: Joi.string().optional().messages({
    "any.required": "URN is required",
  }),

  branch: Joi.string().optional().messages({
    "any.required": "Branch is required",
  }),

  yearOfAdmission: Joi.number()
    .integer()
    .min(minYear)
    .max(currentYear)
    .optional()
    .messages({
      "number.base": "Year of Admission must be a valid number",
      "number.min": `Year of Admission cannot be earlier than ${minYear}`,
      "number.max": `Year of Admission cannot be later than ${currentYear}`,
    }),

  // Acadamics field itself is optional now, as some parts may be updated individually
  acadamics: Joi.object({
    branch: Joi.string().optional(),
    urn: Joi.string().optional(),
    yearOfAdmission: Joi.number()
      .integer()
      .min(minYear)
      .max(currentYear)
      .optional(),
  }).optional(),

  image: Joi.string().optional().uri().messages({
    "string.uri": "Image URL must be a valid URI",
  }),
});

export default updateUserSchema;

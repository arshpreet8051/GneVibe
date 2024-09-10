import Joi from "joi";

const currentYear = new Date().getFullYear();
const minYear = currentYear - 4;

const userSchema = Joi.object({
  name: Joi.string().required().messages({
    "any.required": "Name is required",
  }),

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

  branch: Joi.string().required().messages({
    "any.required": "Branch is required",
  }),

  crn: Joi.string().required().messages({
    "any.required": "CRN is required",
  }),

  urn: Joi.string().required().messages({
    "any.required": "URN is required",
  }),

  yearOfAdmission: Joi.number()
    .integer()
    .min(minYear)
    .max(currentYear)
    .required()
    .messages({
      "any.required": "Year of Admission is required",
      "number.base": "Year of Admission must be a valid number",
      "number.min": `Year of Admission cannot be earlier than ${minYear}`,
      "number.max": `Year of Admission cannot be later than ${currentYear}`,
    }),
});

export default userSchema;

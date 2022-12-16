import * as Joi from 'joi';

export const JoiSchemaValidation = Joi.object({
  NODE_ENV: Joi.string().required(),
  PORT: Joi.number().default(3000),
  BASE_URL: Joi.required(),
  BASE_URL_API: Joi.required(),
  BASE_URL_FRONTEND: Joi.required(),
  ALLOWED_ORIGINS: Joi.string().required(),

  // MongoDB
  MONGODB_URI: Joi.required(),
  MONGODB_DEFAULT_LIMIT: Joi.number().default(10),

  // Authentication (JWT/Passport)
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_REFRESH_SECRET: Joi.string().min(16).required(),
  JWT_SECRET_LIFETIME: Joi.required(),
  JWT_REFRESH_LIFETIME: Joi.required(),
  JWT_REFRESH_COOKIE_LIFETIME: Joi.number().required(),

  // Password Reset & Single use Cods
  PWD_RESET_SECRET: Joi.string().required(),
  PWD_RESET_EXP: Joi.string().required(),

  // Mailing
  MAILER_HOST: Joi.string().required(),
  MAILER_PORT: Joi.number().required(),
  MAILER_IGNORE_TLS: Joi.boolean().default(true),
  MAILER_SECURE: Joi.boolean().required(),
  MAILER_USER: Joi.string().required(),
  MAILER_PWD: Joi.string().required(),
  MAILER_DEFAULT_FROM: Joi.string().required(),
});

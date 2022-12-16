export const AppConfiguration = () => ({
  enviroment: process.env.NODE_ENV || 'dev',
  port: +process.env.PORT || 5000,
  base_url: process.env.BASE_URL || 'http://localhost:5000',
  base_url_api: process.env.BASE_URL_API || 'http://localhost:5000/v1',
  base_url_frontend: process.env.BASE_URL_FRONTEND || 'https://ikusamedia-fe-vercel.app',
  allowed_origins: process.env?.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.includes(',')
      ? process.env.ALLOWED_ORIGINS.split(',')
      : [process.env.ALLOWED_ORIGINS]
    : ['http://localhost', 'http://127.0.0.1'],

  // MongoDB
  mongodb_uri: process.env.MONGODB_URI,
  mongodb_default_limit: +process.env.MONGODB_DEFAULT_LIMIT || 10,

  // Authentication (JWT/Passport)
  jwt_secret: process.env.JWT_SECRET,
  jwt_refresh_secret: process.env.JWT_REFRESH_SECRET,
  jwt_access_lifetime: process.env.JWT_ACCESS_LIFETIME || '3m',
  jwt_refresh_lifetime: process.env.JWT_REFRESH_LIFETIME || '3d',

  // Password Reset & Single use Cods
  pwd_reset_secret: process.env.PWD_RESET_SECRET,
  pwd_reset_exp: process.env.PWD_RESET_EXP,

  // Mailing
  mailer_host: process.env.MAILER_HOST,
  mailer_port: process.env.MAILER_PORT,
  mailer_ignore_tls: process.env.MAILER_IGNORE_TLS || true,
  mailer_secure: process.env.MAILER_SECURE,
  mailer_user: process.env.MAILER_USER,
  mailer_pwd: process.env.MAILER_PWD,
  mailer_default_from: process.env.MAILER_DEFAULT_FROM,
});

// eslint-disable-next-line @typescript-eslint/no-var-requires
const dotenv = require('dotenv');

dotenv.config();

const env = (key: string, defaultValue: any = undefined) => {
  return process.env[key] || defaultValue;
};

env.require = (key: string, defaultValue: any = undefined) => {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Environment variable '${key}' is missing!`);
  }
  return value;
};

const folderName =
  process.env.NODE_ENV === 'production'
    ? `secret_santa_${process.env.NODE_ENV}`
    : 'secret_santa_development';

const config = {
  app: {
    name: 'secret santa',
    port: parseInt(env('APP_PORT', 4000)),
    hostname: env('APP_HOSTNAME', '0.0.0.0'),
    host: env(
      'APP_HOST',
      `http://localhost:${parseInt(env('APP_PORT', 4000))}`,
    ),
    baseUrl: env('BASE_URL'),
  },
  cloudinary: {
    cloudName: env('CLOUD_NAME'),
    apiKey: env('CLOUD_API_KEY'),
    apiSecret: env('CLOUD_API_SECRET'),
    folderName,
  },
  db: {
    url: env.require('DATABASE_URL'),
  },
  environment: env.require('NODE_ENV', 'development'),
  googleAuth: {
    clientId: env('GOOGLE_CLIENT_ID'),
    clientSecret: env('GOOGLE_CLIENT_SECRET'),
    callback: env('GOOGLE_CALLBACK_URL'),
  },
  jwt: {
    secret: env.require('JWT_SECRET'),
    expiresIn: parseInt(env('JWT_EXPIRES_IN', 60 * 60)),
  },
  messaging: {
    mail: {
      host: env('MAIL_HOST'),
      port: env('MAIL_PORT'),
      user: env('MAIL_USER'),
      password: env('MAIL_PASSWORD'),
    },
  },
  redis: {
    url: env('REDIS_URL'),
    ttl: env('REDIS_TTL'),
    host: env.require('REDIS_HOST'),
    port: parseInt(env('REDIS_PORT', '6379')),
  },
  swagger: {
    user: {
      [env('SWAGGER_USER_NAME', 'swaggerAdmin')]: env(
        'SWAGGER_USER_PASSWORD',
        '12345@',
      ),
    },
  },
};

export default () => config;

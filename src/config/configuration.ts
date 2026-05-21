/** biome-ignore-all lint/security/noSecrets: not real secrets */
export default () => ({
  APP_NAME: process.env.APP_NAME || 'MyAwesomeApp',
  EMAIL_VERIFICATION_BASE_URL: process.env.EMAIL_VERIFICATION_BASE_URL || 'http://localhost:3000',
  EMAIL_VERIFICATION_SECRET: process.env.EMAIL_VERIFICATION_SECRET || 'email-verification-secret',
  EMAIL_VERIFICATION_TOKEN_TTL_SECONDS: process.env.EMAIL_VERIFICATION_TOKEN_TTL_SECONDS || '86400',
  AUTH_TOKEN_SECRET: process.env.AUTH_TOKEN_SECRET || 'auth-token-secret',
  AUTH_TOKEN_TTL_SECONDS: process.env.AUTH_TOKEN_TTL_SECONDS || '86400',
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || 'my-secret-pw',
  },
});

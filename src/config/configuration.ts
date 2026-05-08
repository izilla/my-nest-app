/** biome-ignore-all lint/security/noSecrets: not real secrets */
export default () => ({
  APP_NAME: process.env.APP_NAME || 'MyAwesomeApp',
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    username: process.env.DATABASE_USERNAME || 'root',
    password: process.env.DATABASE_PASSWORD || 'my-secret-pw',
  },
});

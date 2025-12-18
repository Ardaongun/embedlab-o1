export const CONFIGS = {
    NodeEnv: process.env.NODE_ENV,
    Port: process.env.PORT,
    DB_URI: process.env.DB_URI,
    ACCESS_SECRET: process.env.ACCESS_SECRET,
    URL_SECRET: process.env.URL_SECRET,
    SUPER_ADMIN: {
        username: process.env.SUPER_ADMIN_USERNAME,
        password: process.env.SUPER_ADMIN_PASSWORD
    },
    SENTRY_DSN: process.env.SENTRY_DSN,
    LOG_LEVEL: process.env.LOG_LEVEL,
    LOGTAIL_SOURCE_TOKEN: process.env.LOGTAIL_SOURCE_TOKEN,
    LOGTAIL_URL: process.env.LOGTAIL_URL,
    JWT_ISSUER: "embedlab-o1",
};
export const CONFIGS = {
    Port: process.env.PORT,
    DB_URI: process.env.DB_URI,
    ACCESS_SECRET: process.env.ACCESS_SECRET,
    SUPER_ADMIN: {
        username: process.env.SUPER_ADMIN_USERNAME,
        password: process.env.SUPER_ADMIN_PASSWORD
    }
};
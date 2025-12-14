export const envConfig = {
    PORT: process.env.PORT || 8080,
    NODE_ENV: process.env.NODE_ENV || 'development',
    DB: {
        MONGO_URI: process.env.MONGO_URI || '',
    }
}
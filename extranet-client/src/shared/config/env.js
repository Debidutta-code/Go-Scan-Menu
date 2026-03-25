/**
 * Centralized environment configuration
 * Vite exposes env variables via import.meta.env
 */
const env = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    PUBLIC_BASE_URL: import.meta.env.VITE_PUBLIC_BASE_URL,
    APP_NAME: import.meta.env.VITE_APP_NAME,
    SOCKET_URL: import.meta.env.VITE_SOCKET_URL,
    ENABLE_ANALYTICS: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    IS_DEV: import.meta.env.DEV,
    IS_PROD: import.meta.env.PROD,
    CLIENT_URL: import.meta.env.VITE_CLIENT_URL,
};
export default env;

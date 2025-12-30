// Token storage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const CART_KEY = 'cart_data';
const TABLE_INFO_KEY = 'table_info';
export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY);
};
export const setToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token);
};
export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};
export const getUser = () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
};
export const setUser = (user) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
};
export const removeUser = () => {
    localStorage.removeItem(USER_KEY);
};
export const getCart = () => {
    const cart = localStorage.getItem(CART_KEY);
    return cart ? JSON.parse(cart) : [];
};
export const setCart = (cart) => {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
};
export const clearCart = () => {
    localStorage.removeItem(CART_KEY);
};
export const getTableInfo = () => {
    const tableInfo = localStorage.getItem(TABLE_INFO_KEY);
    return tableInfo ? JSON.parse(tableInfo) : null;
};
export const setTableInfo = (tableInfo) => {
    localStorage.setItem(TABLE_INFO_KEY, JSON.stringify(tableInfo));
};
export const clearTableInfo = () => {
    localStorage.removeItem(TABLE_INFO_KEY);
};
export const clearAll = () => {
    localStorage.clear();
};

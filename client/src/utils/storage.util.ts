// Token storage
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'user_data';
const CART_KEY = 'cart_data';
const TABLE_INFO_KEY = 'table_info';

export const getToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
};

export const getUser = (): any => {
  const user = localStorage.getItem(USER_KEY);
  return user ? JSON.parse(user) : null;
};

export const setUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const removeUser = (): void => {
  localStorage.removeItem(USER_KEY);
};

export const getCart = (): any[] => {
  const cart = localStorage.getItem(CART_KEY);
  return cart ? JSON.parse(cart) : [];
};

export const setCart = (cart: any[]): void => {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
};

export const clearCart = (): void => {
  localStorage.removeItem(CART_KEY);
};

export const getTableInfo = (): any => {
  const tableInfo = localStorage.getItem(TABLE_INFO_KEY);
  return tableInfo ? JSON.parse(tableInfo) : null;
};

export const setTableInfo = (tableInfo: any): void => {
  localStorage.setItem(TABLE_INFO_KEY, JSON.stringify(tableInfo));
};

export const clearTableInfo = (): void => {
  localStorage.removeItem(TABLE_INFO_KEY);
};

export const clearAll = (): void => {
  localStorage.clear();
};

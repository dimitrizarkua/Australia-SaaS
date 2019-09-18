export enum Key {
  access_token = 'access_token',
  refresh_token = 'refresh_token'
}

const getItem = <T>(key: string): T | null => {
  const value = window.sessionStorage.getItem(key);
  if (value) {
    try {
      return JSON.parse(value);
    } catch (e) {
      return null;
    }
  }
  return null;
};

const removeItem = (key: string): void => {
  window.sessionStorage.removeItem(key);
};

const setItem = (key: string, value: any): void => {
  window.sessionStorage.setItem(key, JSON.stringify(value));
};

export default {
  removeItem,
  getItem,
  setItem
};

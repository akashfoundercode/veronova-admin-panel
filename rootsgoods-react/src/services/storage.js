import { INITIAL_MOCK_DATA } from './mockData';

const STORAGE_KEY = 'rg_react_demo_data';

export const getStore = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_MOCK_DATA));
      return JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Storage parse error, resetting:', e);
    return JSON.parse(JSON.stringify(INITIAL_MOCK_DATA));
  }
};

export const setStore = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Storage write error:', e);
  }
};

export const resetStore = () => {
  localStorage.removeItem(STORAGE_KEY);
  return getStore();
};

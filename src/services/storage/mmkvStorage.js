import {TurboModuleRegistry} from 'react-native';
import {createMMKV} from 'react-native-mmkv';

let mmkvInstance;
let mmkvUnavailableReason;
const memoryStore = new Map();

const createMemoryStorage = () => ({
  set(key, value) {
    memoryStore.set(key, String(value));
  },
  getString(key) {
    return memoryStore.has(key) ? memoryStore.get(key) : undefined;
  },
  delete(key) {
    memoryStore.delete(key);
  },
});

const hasNitroModules = () => {
  try {
    return Boolean(TurboModuleRegistry.get('NitroModules'));
  } catch {
    return false;
  }
};

const getStorage = () => {
  if (mmkvInstance) {
    return mmkvInstance;
  }

  if (mmkvUnavailableReason) {
    return createMemoryStorage();
  }

  if (!hasNitroModules()) {
    mmkvUnavailableReason = 'NitroModules native module unavailable';
    console.warn('MMKV unavailable, using in-memory storage:', mmkvUnavailableReason);
    return createMemoryStorage();
  }

  try {
    mmkvInstance = createMMKV({
      id: 'nsrit-connect-storage',
    });
    return mmkvInstance;
  } catch (error) {
    mmkvUnavailableReason = error?.message || 'MMKV native module unavailable';
    console.warn('MMKV unavailable, using in-memory storage:', mmkvUnavailableReason);
    return createMemoryStorage();
  }
};

const storage = {
  set(key, value) {
    getStorage().set(key, value);
  },
  getString(key) {
    return getStorage().getString(key);
  },
  delete(key) {
    getStorage().delete(key);
  },
};

export {storage};

export const setJSON = (key, value) => {
  try {
    storage.set(key, JSON.stringify(value));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('setJSON failed:', e);
  }
};

export const getJSON = key => {
  try {
    const value = storage.getString(key);
    return value ? JSON.parse(value) : null;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('getJSON failed:', e);
    return null;
  }
};

export const removeStorageKeys = keys => {
  try {
    keys.forEach(key => storage.delete(key));
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('removeStorageKeys failed:', e);
  }
};

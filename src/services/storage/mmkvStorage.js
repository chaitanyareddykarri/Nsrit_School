import { TurboModuleRegistry } from 'react-native';
import { createMMKV } from 'react-native-mmkv';
import * as Keychain from 'react-native-keychain';

// ── Keychain constants ────────────────────────────────────────────────────────

const KEYCHAIN_SERVICE  = 'com.nsritschoolapp.storage';
const KEYCHAIN_USERNAME = 'mmkv_enc_key';

// ── In-memory fallback (used when MMKV native module is unavailable) ──────────

const memoryStore = new Map();

const createMemoryStorage = () => ({
  set(key, value)    { memoryStore.set(key, String(value)); },
  getString(key)     { return memoryStore.has(key) ? memoryStore.get(key) : undefined; },
  delete(key)        { memoryStore.delete(key); },
});

// ── Module state ──────────────────────────────────────────────────────────────

let mmkvInstance;
let mmkvUnavailableReason;

const hasNitroModules = () => {
  try {
    return Boolean(TurboModuleRegistry.get('NitroModules'));
  } catch {
    return false;
  }
};

const getStorage = () => {
  if (mmkvInstance)          return mmkvInstance;
  if (mmkvUnavailableReason) return createMemoryStorage();

  if (!hasNitroModules()) {
    mmkvUnavailableReason = 'NitroModules native module unavailable';
    console.warn('MMKV unavailable, using in-memory storage:', mmkvUnavailableReason);
    return createMemoryStorage();
  }

  try {
    // Unencrypted instance used only until initSecureStorage() completes.
    // Any data written here is abandoned when the encrypted instance is installed.
    mmkvInstance = createMMKV({ id: 'nsrit-connect-storage' });
    return mmkvInstance;
  } catch (error) {
    mmkvUnavailableReason = error?.message || 'MMKV native module unavailable';
    console.warn('MMKV unavailable, using in-memory storage:', mmkvUnavailableReason);
    return createMemoryStorage();
  }
};

// ── Public storage interface ──────────────────────────────────────────────────

export const storage = {
  set(key, value)  { getStorage().set(key, value); },
  getString(key)   { return getStorage().getString(key); },
  delete(key)      { getStorage().delete(key); },
};

// ── Secure initialisation ─────────────────────────────────────────────────────

/**
 * Must be called once at app startup (before the first authenticated operation).
 *
 * Reads (or generates) a 256-bit encryption key from the platform Keychain /
 * Keystore, then replaces the MMKV instance with an encrypted one.  Any data
 * written to the unencrypted bootstrap instance is intentionally abandoned —
 * Firebase Auth will refresh the session automatically on next launch.
 *
 * Call this from your root component before rendering authenticated screens:
 *
 *   import { initSecureStorage } from './src/services/storage/mmkvStorage';
 *   await initSecureStorage();
 */
export const initSecureStorage = async () => {
  if (mmkvUnavailableReason) return; // MMKV not available — memory fallback in use

  try {
    let encKey;

    const existing = await Keychain.getGenericPassword({ service: KEYCHAIN_SERVICE });
    if (existing) {
      encKey = existing.password;
    } else {
      // Generate a cryptographically random 256-bit key on first install.
      const bytes = new Uint8Array(32);
      global.crypto.getRandomValues(bytes);
      encKey = Array.from(bytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      await Keychain.setGenericPassword(KEYCHAIN_USERNAME, encKey, {
        service: KEYCHAIN_SERVICE,
        accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
    }

    // Install the encrypted instance.  Any values stored in the bootstrap
    // (unencrypted) instance are abandoned; the app will re-authenticate.
    mmkvInstance = createMMKV({ id: 'nsrit-connect-storage', encryptionKey: encKey });
  } catch (error) {
    // Non-fatal: app continues with unencrypted MMKV rather than crashing.
    console.warn('[Storage] Secure storage init failed, using unencrypted fallback:', error.message);
  }
};

// ── JSON helpers ──────────────────────────────────────────────────────────────

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

/**
 * Air-Gapped Persistent Storage Adapter using IndexedDB with fallback to localStorage.
 * Enables DLT blockchain state, recipient keystores, and encrypted packages
 * to survive browser refreshes and system reboots in an isolated offline environment.
 */

const DB_NAME = 'sih26237_airgap_store_v1';
const DB_VERSION = 2;
const STORES = {
  BLOCKS: 'blocks',
  RECIPIENTS: 'recipients',
  PACKAGES: 'packages',
  KEYSTORES: 'keystores',
  AUDIT_LOGS: 'audit_logs',
  VALIDATOR_KEYS: 'validator_keys',
};

class AirGappedStorage {
  private db: IDBDatabase | null = null;
  private isReadyPromise: Promise<boolean>;

  constructor() {
    this.isReadyPromise = this.initDB();
  }

  private async initDB(): Promise<boolean> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('[AirGappedStorage] IndexedDB unavailable, using memory/localStorage fallback.');
      return false;
    }

    return new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORES.BLOCKS)) {
            db.createObjectStore(STORES.BLOCKS, { keyPath: 'height' });
          }
          if (!db.objectStoreNames.contains(STORES.RECIPIENTS)) {
            db.createObjectStore(STORES.RECIPIENTS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(STORES.PACKAGES)) {
            db.createObjectStore(STORES.PACKAGES, { keyPath: 'packageId' });
          }
          if (!db.objectStoreNames.contains(STORES.KEYSTORES)) {
            db.createObjectStore(STORES.KEYSTORES, { keyPath: 'keyId' });
          }
          if (!db.objectStoreNames.contains(STORES.AUDIT_LOGS)) {
            db.createObjectStore(STORES.AUDIT_LOGS, { autoIncrement: true });
          }
          if (!db.objectStoreNames.contains(STORES.VALIDATOR_KEYS)) {
            db.createObjectStore(STORES.VALIDATOR_KEYS, { keyPath: 'validatorId' });
          }
        };

        request.onsuccess = () => {
          this.db = request.result;
          resolve(true);
        };

        request.onerror = () => {
          console.warn('[AirGappedStorage] IndexedDB open error, falling back.');
          resolve(false);
        };
      } catch (err) {
        console.warn('[AirGappedStorage] Initialization failed:', err);
        resolve(false);
      }
    });
  }

  public async isReady(): Promise<boolean> {
    return this.isReadyPromise;
  }

  // --- BLOCKS ---
  public async saveBlocks(blocks: any[]): Promise<void> {
    await this.isReady();
    if (this.db) {
      const tx = this.db.transaction(STORES.BLOCKS, 'readwrite');
      const store = tx.objectStore(STORES.BLOCKS);
      for (const b of blocks) {
        store.put(b);
      }
    } else {
      localStorage.setItem('sih_dlt_blocks', JSON.stringify(blocks));
    }
  }

  public async getBlocks(): Promise<any[] | null> {
    await this.isReady();
    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db!.transaction(STORES.BLOCKS, 'readonly');
        const store = tx.objectStore(STORES.BLOCKS);
        const req = store.getAll();
        req.onsuccess = () => {
          const res = req.result;
          resolve(res && res.length > 0 ? res.sort((a, b) => a.height - b.height) : null);
        };
        req.onerror = () => resolve(null);
      });
    } else {
      const item = localStorage.getItem('sih_dlt_blocks');
      return item ? JSON.parse(item) : null;
    }
  }

  public async clearBlocks(): Promise<void> {
    await this.isReady();
    if (this.db) {
      const tx = this.db.transaction(STORES.BLOCKS, 'readwrite');
      tx.objectStore(STORES.BLOCKS).clear();
    } else {
      localStorage.removeItem('sih_dlt_blocks');
    }
  }

  // --- PACKAGES ---
  public async savePackage(pkg: any): Promise<void> {
    await this.isReady();
    if (this.db) {
      const tx = this.db.transaction(STORES.PACKAGES, 'readwrite');
      tx.objectStore(STORES.PACKAGES).put(pkg);
    } else {
      const existing = await this.getPackages() || [];
      const updated = existing.filter(p => p.packageId !== pkg.packageId).concat(pkg);
      localStorage.setItem('sih_packages', JSON.stringify(updated));
    }
  }

  public async getPackages(): Promise<any[] | null> {
    await this.isReady();
    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db!.transaction(STORES.PACKAGES, 'readonly');
        const req = tx.objectStore(STORES.PACKAGES).getAll();
        req.onsuccess = () => resolve(req.result.length > 0 ? req.result : null);
        req.onerror = () => resolve(null);
      });
    } else {
      const item = localStorage.getItem('sih_packages');
      return item ? JSON.parse(item) : null;
    }
  }

  // --- KEYSTORES ---
  public async saveKeystore(keystore: { keyId: string; [key: string]: any }): Promise<void> {
    await this.isReady();
    if (this.db) {
      const tx = this.db.transaction(STORES.KEYSTORES, 'readwrite');
      const store = tx.objectStore(STORES.KEYSTORES);
      store.put(keystore);
    } else {
      const allStr = localStorage.getItem('sih_keystores');
      const all = allStr ? JSON.parse(allStr) : {};
      all[keystore.keyId] = keystore;
      localStorage.setItem('sih_keystores', JSON.stringify(all));
    }
  }

  public async getKeystore(keyId: string): Promise<any | null> {
    await this.isReady();
    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db!.transaction(STORES.KEYSTORES, 'readonly');
        const req = tx.objectStore(STORES.KEYSTORES).get(keyId);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => resolve(null);
      });
    } else {
      const allStr = localStorage.getItem('sih_keystores');
      const all = allStr ? JSON.parse(allStr) : {};
      return all[keyId] || null;
    }
  }

  // --- VALIDATOR SIGNING KEYS ---
  // Browser-local validator keys persist as CryptoKey objects in IndexedDB.
  // This is an offline demo boundary, not HSM-grade key protection.
  public async saveValidatorKeyPair(validatorId: string, keyPair: CryptoKeyPair): Promise<void> {
    await this.isReady();
    if (!this.db) return;
    const tx = this.db.transaction(STORES.VALIDATOR_KEYS, 'readwrite');
    tx.objectStore(STORES.VALIDATOR_KEYS).put({ validatorId, privateKey: keyPair.privateKey, publicKey: keyPair.publicKey });
  }

  public async getValidatorKeyPair(validatorId: string): Promise<CryptoKeyPair | null> {
    await this.isReady();
    if (!this.db) return null;
    return new Promise((resolve) => {
      const tx = this.db!.transaction(STORES.VALIDATOR_KEYS, 'readonly');
      const req = tx.objectStore(STORES.VALIDATOR_KEYS).get(validatorId);
      req.onsuccess = () => {
        const value = req.result;
        resolve(value ? { privateKey: value.privateKey, publicKey: value.publicKey } : null);
      };
      req.onerror = () => resolve(null);
    });
  }

  // --- RECIPIENTS ---
  public async saveRecipients(recipients: any[]): Promise<void> {
    await this.isReady();
    if (this.db) {
      const tx = this.db.transaction(STORES.RECIPIENTS, 'readwrite');
      const store = tx.objectStore(STORES.RECIPIENTS);
      for (const r of recipients) {
        store.put(r);
      }
    } else {
      localStorage.setItem('sih_recipients', JSON.stringify(recipients));
    }
  }

  public async getRecipients(): Promise<any[] | null> {
    await this.isReady();
    if (this.db) {
      return new Promise((resolve) => {
        const tx = this.db!.transaction(STORES.RECIPIENTS, 'readonly');
        const req = tx.objectStore(STORES.RECIPIENTS).getAll();
        req.onsuccess = () => resolve(req.result.length > 0 ? req.result : null);
        req.onerror = () => resolve(null);
      });
    } else {
      const item = localStorage.getItem('sih_recipients');
      return item ? JSON.parse(item) : null;
    }
  }

  // --- HARD RESET ---
  public async clearAll(): Promise<void> {
    await this.isReady();
    if (this.db) {
      const tx = this.db.transaction([STORES.BLOCKS, STORES.RECIPIENTS, STORES.PACKAGES, STORES.KEYSTORES, STORES.AUDIT_LOGS, STORES.VALIDATOR_KEYS], 'readwrite');
      tx.objectStore(STORES.BLOCKS).clear();
      tx.objectStore(STORES.RECIPIENTS).clear();
      tx.objectStore(STORES.PACKAGES).clear();
      tx.objectStore(STORES.KEYSTORES).clear();
      tx.objectStore(STORES.AUDIT_LOGS).clear();
      tx.objectStore(STORES.VALIDATOR_KEYS).clear();
    }
    localStorage.removeItem('sih_dlt_blocks');
    localStorage.removeItem('sih_packages');
    localStorage.removeItem('sih_recipients');
  }
}

export const airGappedStorage = new AirGappedStorage();

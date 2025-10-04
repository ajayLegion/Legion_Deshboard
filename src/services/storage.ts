// IndexedDB wrapper for local storage
const DB_NAME = 'NotionCloneDB';
const DB_VERSION = 1;
const PAGES_STORE = 'pages';

export interface Page {
  id: string;
  title: string;
  content: string;
  parentId: string | null;
  createdAt: number;
  updatedAt: number;
  order: number;
}

class StorageService {
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(PAGES_STORE)) {
          const store = db.createObjectStore(PAGES_STORE, { keyPath: 'id' });
          store.createIndex('parentId', 'parentId', { unique: false });
          store.createIndex('order', 'order', { unique: false });
        }
      };
    });
  }

  async getAllPages(): Promise<Page[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(PAGES_STORE, 'readonly');
      const store = transaction.objectStore(PAGES_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async getPage(id: string): Promise<Page | undefined> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(PAGES_STORE, 'readonly');
      const store = transaction.objectStore(PAGES_STORE);
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async savePage(page: Page): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(PAGES_STORE, 'readwrite');
      const store = transaction.objectStore(PAGES_STORE);
      const request = store.put(page);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deletePage(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(PAGES_STORE, 'readwrite');
      const store = transaction.objectStore(PAGES_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async searchPages(query: string): Promise<Page[]> {
    const pages = await this.getAllPages();
    const lowerQuery = query.toLowerCase();
    
    return pages.filter(page => 
      page.title.toLowerCase().includes(lowerQuery) ||
      page.content.toLowerCase().includes(lowerQuery)
    );
  }
}

export const storage = new StorageService();

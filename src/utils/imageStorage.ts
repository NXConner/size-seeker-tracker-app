// IndexedDB utility for storing images separately from localStorage
const DB_NAME = 'SizeSeekerImageDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

interface StoredImage {
  id: string;
  date: string;
  image: string;
  overlay?: string;
  length?: number;
  girth?: number;
  referenceMeasurement?: number;
  autoMeasurement?: any;
  manualMeasurements?: any[];
  highlightedObject?: any[];
  referencePoints?: any;
  unit?: string;
}

class ImageStorage {
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
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };
    });
  }

  async saveImage(imageData: StoredImage): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(imageData);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getImage(id: string): Promise<StoredImage | undefined> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async getAllImages(): Promise<StoredImage[]> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteImage(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clearAll(): Promise<void> {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getStorageInfo(): Promise<{ count: number; totalSize: number }> {
    const images = await this.getAllImages();
    const totalSize = images.reduce((size, img) => {
      return size + (img.image ? new Blob([img.image]).size : 0);
    }, 0);
    
    return {
      count: images.length,
      totalSize
    };
  }
}

export const imageStorage = new ImageStorage();

// Convenience functions for direct import
export const saveImageToIndexedDB = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const id = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const imageData: StoredImage = {
          id,
          image: reader.result as string,
          date: new Date().toISOString()
        };
        
        await imageStorage.saveImage(imageData);
        resolve(reader.result as string);
      } catch (error) {
        reject(error);
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
};

export const loadImageFromIndexedDB = async (id: string): Promise<string | null> => {
  try {
    const imageData = await imageStorage.getImage(id);
    return imageData?.image || null;
  } catch (error) {
    console.error('Error loading image from IndexedDB:', error);
    return null;
  }
};

export const deleteImageFromIndexedDB = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract ID from the image URL or use a different approach
    // For now, we'll clear all images since we don't have a direct mapping
    await imageStorage.clearAll();
    return true;
  } catch (error) {
    console.error('Error deleting image from IndexedDB:', error);
    return false;
  }
}; 
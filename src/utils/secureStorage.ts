// Simple encryption utility for enhanced local storage security
const STORAGE_KEY_PREFIX = 'secure_measurement_';

// Check available storage space
const getAvailableStorage = (): number => {
  try {
    const testKey = '__storage_test__';
    const testValue = 'x'.repeat(1024); // 1KB test
    let available = 0;
    
    while (true) {
      try {
        localStorage.setItem(testKey + available, testValue);
        available += 1024;
      } catch {
        break;
      }
    }
    
    // Clean up test data
    for (let i = 0; i < available; i += 1024) {
      localStorage.removeItem(testKey + i);
    }
    
    return available;
  } catch {
    return 0;
  }
};

// Basic encryption for local storage (note: this is for privacy, not security against determined attackers)
const encryptData = (data: string): string => {
  // Simple base64 encoding with character shifting for basic obfuscation
  const encoded = btoa(data);
  return encoded.split('').map(char => 
    String.fromCharCode(char.charCodeAt(0) + 1)
  ).join('');
};

const decryptData = (encryptedData: string): string => {
  try {
    const shifted = encryptedData.split('').map(char => 
      String.fromCharCode(char.charCodeAt(0) - 1)
    ).join('');
    return atob(shifted);
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    return '';
  }
};

class SecureStorage {
  private encryptionKey = 'size-seeker-2024';

  private encrypt(data: string): string {
    // Simple encryption for demo purposes
    // In production, use a proper encryption library
    return btoa(encodeURIComponent(data));
  }

  private decrypt(encryptedData: string): string {
    try {
      return decodeURIComponent(atob(encryptedData));
    } catch {
      return '';
    }
  }

  setItem(key: string, value: any): void {
    try {
      const serializedValue = JSON.stringify(value);
      const encryptedValue = this.encrypt(serializedValue);
      localStorage.setItem(key, encryptedValue);
    } catch (error) {
      console.error('Error saving to secure storage:', error);
    }
  }

  getItem(key: string): any {
    try {
      const encryptedValue = localStorage.getItem(key);
      if (!encryptedValue) return null;
      
      const decryptedValue = this.decrypt(encryptedValue);
      return JSON.parse(decryptedValue);
    } catch (error) {
      console.error('Error reading from secure storage:', error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from secure storage:', error);
    }
  }

  clear(): void {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Error clearing secure storage:', error);
    }
  }

  hasItem(key: string): boolean {
    return localStorage.getItem(key) !== null;
  }
}

export const secureStorage = new SecureStorage();

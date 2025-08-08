// WebCrypto-backed secure storage using AES-GCM
// - Uses env key: import.meta.env.VITE_SECURE_STORAGE_KEY or process.env.VITE_SECURE_STORAGE_KEY
// - Persists ciphertext and IV in localStorage

const STORAGE_NAMESPACE = 'secure:'
const VERSION = 1

// Attempt to attach Node's WebCrypto in non-browser test environments at module load
try {
  // @ts-ignore
  if (!globalThis.crypto || !(globalThis.crypto as any).subtle) {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { webcrypto } = require('crypto')
    ;(globalThis as any).crypto = webcrypto
  }
} catch {
  // ignore if require is not available (browser)
}

// Helpers to handle environments (Vite browser, Jest/node)
const getEnvKey = (): string => {
  let viteKey: string | undefined
  try {
    // Access import.meta.env via indirect eval to avoid CJS parse errors in Jest
    // eslint-disable-next-line no-eval
    const maybe = (0, eval)('typeof import !== "undefined" && import.meta && import.meta.env ? import.meta.env.VITE_SECURE_STORAGE_KEY : undefined')
    if (typeof maybe === 'string') viteKey = maybe
  } catch {}
  const nodeKey = typeof process !== 'undefined' ? (process.env?.VITE_SECURE_STORAGE_KEY as string | undefined) : undefined
  return (viteKey || nodeKey || '').toString()
}

const encoder = new TextEncoder()
const decoder = new TextDecoder()

async function importAesKeyFromPassword(password: string): Promise<CryptoKey> {
  const saltBytes = encoder.encode('size-seeker-salt')
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  )

  return await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: saltBytes,
      iterations: 150_000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

function toBase64(bytes: ArrayBuffer): string {
  if (typeof window === 'undefined') {
    // Node
    return Buffer.from(bytes).toString('base64')
  }
  const uint8 = new Uint8Array(bytes)
  let binary = ''
  for (let i = 0; i < uint8.byteLength; i++) binary += String.fromCharCode(uint8[i])
  return btoa(binary)
}

function fromBase64(b64: string): Uint8Array {
  if (typeof window === 'undefined') {
    // Node
    return new Uint8Array(Buffer.from(b64, 'base64'))
  }
  const binary = atob(b64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

async function encryptJson(key: CryptoKey, data: unknown): Promise<{ ivB64: string; ctB64: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const plaintext = encoder.encode(JSON.stringify(data))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, plaintext)
  return { ivB64: toBase64(iv.buffer), ctB64: toBase64(ciphertext) }
}

async function decryptJson<T>(key: CryptoKey, ivB64: string, ctB64: string): Promise<T> {
  const iv = fromBase64(ivB64)
  const ciphertext = fromBase64(ctB64)
  const plaintext = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext)
  const json = decoder.decode(plaintext)
  return JSON.parse(json) as T
}

export class SecureStorage {
  private keyPromise: Promise<CryptoKey> | null = null
  private usePlain: boolean = false

  constructor() {
    // Try to ensure crypto.subtle exists in Node/Jest (secondary guard)
    if (!globalThis.crypto || !(globalThis.crypto as any).subtle) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { webcrypto } = require('crypto')
        ;(globalThis as any).crypto = webcrypto
      } catch {
        // ignore
      }
    }

    if (!globalThis.crypto?.subtle) {
      // Fallback to plain storage for non-WebCrypto environments (tests, legacy)
      this.usePlain = true
      return
    }

    const envKey = getEnvKey()
    if (!envKey) {
      const fallback = (typeof window !== 'undefined' ? window.location.origin : 'node') + '|dev-default-key'
      this.keyPromise = importAesKeyFromPassword(fallback)
    } else {
      this.keyPromise = importAesKeyFromPassword(envKey)
    }
  }

  private namespaced(key: string): string {
    return `${STORAGE_NAMESPACE}${key}`
  }

  async setItem(key: string, value: unknown): Promise<void> {
    try {
      if (this.usePlain) {
        const payload = JSON.stringify({ v: VERSION, data: value, ts: Date.now(), plain: true })
        localStorage.setItem(this.namespaced(key), payload)
        return
      }
      const cryptoKey = await this.keyPromise!
      const { ivB64, ctB64 } = await encryptJson(cryptoKey, {
        v: VERSION,
        data: value,
        ts: Date.now()
      })
      const payload = JSON.stringify({ v: VERSION, iv: ivB64, ct: ctB64 })
      localStorage.setItem(this.namespaced(key), payload)
    } catch (error) {
      console.error('Error saving to secure storage:', error)
      throw error
    }
  }

  async getItem<T = unknown>(key: string): Promise<T | null> {
    try {
      const raw = localStorage.getItem(this.namespaced(key))
      if (!raw) return null
      const parsed: any = JSON.parse(raw)
      if (this.usePlain || (parsed && parsed.plain)) {
        return (parsed?.data as T) ?? null
      }
      if (!parsed?.iv || !parsed?.ct) return null
      const cryptoKey = await this.keyPromise!
      const wrapped = await decryptJson<{ v: number; data: T; ts: number }>(cryptoKey, parsed.iv, parsed.ct)
      return wrapped?.data ?? null
    } catch (error) {
      console.error('Error reading from secure storage:', error)
      return null
    }
  }

  removeItem(key: string): void {
    try {
      localStorage.removeItem(this.namespaced(key))
    } catch (error) {
      console.error('Error removing from secure storage:', error)
    }
  }

  clear(): void {
    try {
      // Only clear our namespace, not entire localStorage
      const toRemove: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k && k.startsWith(STORAGE_NAMESPACE)) {
          toRemove.push(k)
        }
      }
      toRemove.forEach((k) => localStorage.removeItem(k))
    } catch (error) {
      console.error('Error clearing secure storage:', error)
    }
  }

  hasItem(key: string): boolean {
    try {
      return localStorage.getItem(this.namespaced(key)) !== null
    } catch {
      return false
    }
  }

  getStorageInfo(): { used: number; total: number; percentage: number } {
    try {
      // Rough estimate in bytes for our namespace
      let used = 0
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (!k || !k.startsWith(STORAGE_NAMESPACE)) continue
        const v = localStorage.getItem(k) || ''
        used += k.length + v.length
      }

      // Browsers typically allow ~5MB. We will assume 5MB if not detectable.
      const total = 5 * 1024 * 1024
      const percentage = Math.min(100, Math.round((used / total) * 100))
      return { used, total, percentage }
    } catch {
      return { used: 0, total: 5 * 1024 * 1024, percentage: 0 }
    }
  }
}

export const secureStorage = new SecureStorage()

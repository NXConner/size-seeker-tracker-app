// Provide WebCrypto in Jest (Node)
import { webcrypto } from 'crypto'
import { TextEncoder, TextDecoder } from 'util'

// @ts-ignore
globalThis.crypto = webcrypto as unknown as Crypto

// TextEncoder/TextDecoder for Node
// @ts-ignore
if (typeof globalThis.TextEncoder === 'undefined') globalThis.TextEncoder = TextEncoder as any
// @ts-ignore
if (typeof globalThis.TextDecoder === 'undefined') globalThis.TextDecoder = TextDecoder as any

process.env.VITE_SECURE_STORAGE_KEY = process.env.VITE_SECURE_STORAGE_KEY || 'test-secret-key'

// Minimal ResizeObserver mock for Recharts ResponsiveContainer
// @ts-ignore
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
// @ts-ignore
if (typeof globalThis.ResizeObserver === 'undefined') globalThis.ResizeObserver = ResizeObserverMock
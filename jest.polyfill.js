// Early polyfills for Jest before modules load
const { webcrypto } = require('crypto')

// Ensure crypto with subtle is present before importing app code
globalThis.crypto = webcrypto

// TextEncoder/TextDecoder in Node
const { TextEncoder, TextDecoder } = require('util')
if (typeof globalThis.TextEncoder === 'undefined') globalThis.TextEncoder = TextEncoder
if (typeof globalThis.TextDecoder === 'undefined') globalThis.TextDecoder = TextDecoder

process.env.VITE_SECURE_STORAGE_KEY = process.env.VITE_SECURE_STORAGE_KEY || 'test-secret-key'
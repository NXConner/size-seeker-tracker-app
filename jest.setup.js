"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Provide WebCrypto in Jest (Node)
const crypto_1 = require("crypto");
const util_1 = require("util");
// @ts-ignore
globalThis.crypto = crypto_1.webcrypto;
// TextEncoder/TextDecoder for Node
// @ts-ignore
if (typeof globalThis.TextEncoder === 'undefined')
    globalThis.TextEncoder = util_1.TextEncoder;
// @ts-ignore
if (typeof globalThis.TextDecoder === 'undefined')
    globalThis.TextDecoder = util_1.TextDecoder;
process.env.VITE_SECURE_STORAGE_KEY = process.env.VITE_SECURE_STORAGE_KEY || 'test-secret-key';
// Minimal ResizeObserver mock for Recharts ResponsiveContainer
// @ts-ignore
class ResizeObserverMock {
    observe() { }
    unobserve() { }
    disconnect() { }
}
// @ts-ignore
if (typeof globalThis.ResizeObserver === 'undefined')
    globalThis.ResizeObserver = ResizeObserverMock;

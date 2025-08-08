"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const secureStorage_1 = require("@/utils/secureStorage");
describe('secureStorage (AES-GCM)', () => {
    let storage;
    beforeEach(() => {
        storage = new secureStorage_1.SecureStorage();
        // Clear only our namespace keys
        storage.clear();
    });
    it('stores and retrieves an object', async () => {
        const key = 'unit:test:obj';
        const value = { a: 42, b: 'hello' };
        await storage.setItem(key, value);
        const read = await storage.getItem(key);
        expect(read).toEqual(value);
    });
    it('returns null for missing keys', async () => {
        const val = await storage.getItem('unit:missing');
        expect(val).toBeNull();
    });
    it('removeItem deletes a single key', async () => {
        const key = 'unit:remove';
        await storage.setItem(key, { x: 1 });
        expect(await storage.getItem(key)).not.toBeNull();
        storage.removeItem(key);
        expect(await storage.getItem(key)).toBeNull();
    });
    it('clear() only clears namespaced keys', async () => {
        // Put some foreign key
        localStorage.setItem('other', 'value');
        await storage.setItem('one', { ok: true });
        await storage.setItem('two', { ok: true });
        storage.clear();
        expect(await storage.getItem('one')).toBeNull();
        expect(await storage.getItem('two')).toBeNull();
        expect(localStorage.getItem('other')).toBe('value');
    });
});

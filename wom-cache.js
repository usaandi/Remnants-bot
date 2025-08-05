import fs from 'fs/promises';

const CACHE_FILE = './user-cache.json';
const CACHE_MAX_AGE_MS = 60 * 60 * 1000; // 1 hour

export async function loadCache() {
    try {
        const raw = await fs.readFile(CACHE_FILE, 'utf-8');
        return JSON.parse(raw);
    } catch {
        return {};
    }
}

export async function saveCache(cache) {
    await fs.writeFile(CACHE_FILE, JSON.stringify(cache,null ,2));
}
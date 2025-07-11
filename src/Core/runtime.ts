import { readFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';

/**
 * Runtime detection and fallback utilities
 * Provides cross-compatible APIs for Bun and Node.js
 */

// Type-safe Bun detection
declare global {
    var Bun: any;
}

export const isBun = typeof globalThis.Bun !== 'undefined';

/**
 * Cross-compatible file reading
 */
export async function readJsonFile<T>(filePath: string): Promise<T> {
    if (isBun && typeof globalThis.Bun?.file === 'function') {
        const file = globalThis.Bun.file(filePath);
        return await file.json();
    }
    
    else {
        const content = await readFile(filePath, 'utf-8');
        return JSON.parse(content);
    }
}

/**
 * Cross-compatible file existence check
 */
export async function fileExists(filePath: string): Promise<boolean> {
    if (isBun && typeof globalThis.Bun?.file === 'function') {
        const file = globalThis.Bun.file(filePath);
        return await file.exists();
    } else {
        return existsSync(filePath);
    }
}

/**
 * Cross-compatible glob-like file scanning
 * Scans directory for files matching the given extensions
 */
export async function scanFiles(directory: string, extensions: string[] = ['ts', 'js']): Promise<string[]> {
    if (isBun && typeof globalThis.Bun?.Glob === 'function') {
        const glob = new globalThis.Bun.Glob(`*{.${extensions.join(',.')}}`);
        return Array.fromAsync(glob.scan(directory));
    } else {
        try {
            const files = await readdir(directory);
            return files.filter(file =>
                extensions.some(ext => file.endsWith(`.${ext}`)) &&
                !file.includes('.disabled.')
            );
        } catch (error) {
            console.warn(`Failed to scan directory ${directory}:`, error);
            return [];
        }
    }
}

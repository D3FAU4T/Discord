/// <reference types="bun" />
/// <reference types="node" />

import { readJsonFile, fileExists, scanFiles } from '../core/runtime.js';
import path from 'node:path';

// Runtime detection and test framework imports
const isBun = typeof globalThis.Bun !== 'undefined';

if (isBun) {
    // Bun runtime - use bun:test
    const { expect, test, describe } = await import('bun:test');
    
    describe('Runtime Path Utilities - Bun', () => {
        test('should read JSON files correctly', async () => {
            const configPath = path.resolve('src', 'config', 'commands.json');
            const result = await readJsonFile(configPath);
            expect(result).toBeDefined();
            expect(typeof result).toBe('object');
        });

        test('should check file existence correctly', async () => {
            const configPath = path.resolve('src', 'config', 'commands.json');
            const exists = await fileExists(configPath);
            expect(exists).toBe(true);
            
            const nonExistentPath = path.resolve('src', 'config', 'nonexistent.json');
            const notExists = await fileExists(nonExistentPath);
            expect(notExists).toBe(false);
        });

        test('should scan files correctly', async () => {
            const commandsPath = path.resolve('src', 'commands');
            const files = await scanFiles(commandsPath);
            expect(files).toBeDefined();
            expect(Array.isArray(files)).toBe(true);
            expect(files.length).toBeGreaterThan(0);
        });

        test('should test cross-runtime compatibility', async () => {
            // Test that our runtime utilities work the same way in Bun
            const configPath = path.resolve('src', 'config', 'commands.json');
            const bunResult = await readJsonFile(configPath);

            // Verify the structure matches expected Discord bot config
            expect(typeof bunResult).toBe('object');
            expect(Array.isArray(bunResult)).toBe(false);

            // Test file scanning consistency
            const commandsPath = path.resolve('src', 'commands');
            const scannedFiles = await scanFiles(commandsPath);

            // Should find TypeScript files
            const tsFiles = scannedFiles.filter(file => file.endsWith('.ts'));
            expect(tsFiles.length).toBeGreaterThan(0);

            // Should not include disabled files
            const disabledFiles = scannedFiles.filter(file => file.includes('.disabled.'));
            expect(disabledFiles.length).toBe(0);
        });
    });
}

else {
    // Node.js runtime - use node:test
    const { test } = await import('node:test');
    const assert = await import('node:assert');
    
    test('Runtime Path Utilities - Node.js/tsx', async (t) => {
        await t.test('should read JSON files correctly', async () => {
            const configPath = path.resolve('src', 'config', 'commands.json');
            const result = await readJsonFile(configPath);
            (assert.ok as any)(result, 'Result should be defined');
            (assert.strictEqual as any)(typeof result, 'object', 'Result should be an object');
        });

        await t.test('should check file existence correctly', async () => {
            const configPath = path.resolve('src', 'config', 'commands.json');
            const exists = await fileExists(configPath);
            (assert.strictEqual as any)(exists, true, 'Config file should exist');

            const nonExistentPath = path.resolve('src', 'config', 'nonexistent.json');
            const notExists = await fileExists(nonExistentPath);
            (assert.strictEqual as any)(notExists, false, 'Non-existent file should not exist');
        });

        await t.test('should scan files correctly', async () => {
            const commandsPath = path.resolve('src', 'commands');
            const files = await scanFiles(commandsPath);
            (assert.ok as any)(files, 'Files should be defined');
            (assert.ok as any)(Array.isArray(files), 'Files should be an array');
            (assert.ok as any)(files.length > 0, 'Should find at least one file');
        });

        await t.test('should test cross-runtime compatibility', async () => {
            // Test that our runtime utilities work the same way in Node.js
            const configPath = path.resolve('src', 'config', 'commands.json');
            const nodeResult = await readJsonFile(configPath);

            // Verify the structure matches expected Discord bot config
            (assert.ok as any)(typeof nodeResult === 'object', 'Config should be an object');
            (assert.ok as any)(!Array.isArray(nodeResult), 'Config should not be an array');

            // Test file scanning consistency
            const commandsPath = path.resolve('src', 'commands');
            const scannedFiles = await scanFiles(commandsPath);

            // Should find TypeScript files
            const tsFiles = scannedFiles.filter(file => file.endsWith('.ts'));
            (assert.ok as any)(tsFiles.length > 0, 'Should find TypeScript command files');

            // Should not include disabled files
            const disabledFiles = scannedFiles.filter(file => file.includes('.disabled.'));
            (assert.strictEqual as any)(disabledFiles.length, 0, 'Should not include disabled files');
        });
    });
}
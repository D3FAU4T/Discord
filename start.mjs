#!/usr/bin/env node

/**
 * Startup script with runtime detection and fallback
 * Tries Bun first, falls back to Node.js if Bun is not available
 * Uses --env-file flag for Node.js v24 environment loading
 */

import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const env = process.env.NODE_ENV || 'development';
const mainFile = 'index.ts';
const envFile = env === 'production' ? '.env.production.local' : '.env.development.local';

// Check if Bun is available
function isBunAvailable() {
    try {
        const result = spawnSync('bun', ['--version'], {
            stdio: 'ignore',
            timeout: 3000 // 3 second timeout
        });
        return result.status === 0;
    } catch {
        return false;
    }
}

// Start with Bun
function startWithBun() {
    console.log('🚀 Starting with Bun...');
    const args = ['run', mainFile];

    const bunProcess = spawn('bun', args, {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: env }
    });

    bunProcess.on('error', (error) => {
        console.error('❌ Bun failed to start:', error.message);
        console.log('🔄 Falling back to Node.js...');
        startWithNode();
    });

    return bunProcess;
}

// Start with Node.js
function startWithNode() {
    console.log('🟢 Starting with tsx (Node.js)...');
    const args = [];

    if (existsSync(envFile))
        args.push(`--env-file=${envFile}`);

    args.push(mainFile);

    const nodeProcess = spawn('tsx', args, {
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: env }
    });

    nodeProcess.on('error', (error) => {
        console.error('❌ tsx failed to start:', error.message);
        console.error('💡 Make sure tsx is installed: npm install -g tsx');
        process.exit(1);
    });

    return nodeProcess;
}

// Main execution
if (!existsSync(resolve(mainFile))) {
    console.error(`❌ Main file ${mainFile} not found`);
    process.exit(1);
}

console.log(`🔧 Environment: ${env}`);

if (isBunAvailable())
    startWithBun();

else {
    console.warn('⚠️  Bun not found, using Node.js fallback');
    startWithNode();
}

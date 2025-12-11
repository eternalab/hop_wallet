import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './manifest.config'
import path from "node:path";
import zip from 'vite-plugin-zip-pack'
import { name, version } from './package.json'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import { build } from 'vite'

// Build inject.ts to src/content/inject.js before main build
const buildInjectScript = () => ({
    name: 'build-inject-script',
    async buildStart() {
        await build({
            configFile: false,
            publicDir: false,
            build: {
                emptyOutDir: false,
                outDir: 'src/content',
                lib: {
                    entry: path.resolve(__dirname, 'src/content/inject.ts'),
                    name: 'inject',
                    formats: ['iife'],
                    fileName: () => 'inject.js'
                },
                rollupOptions: {
                    output: {
                        extend: true
                    }
                }
            }
        })
    }
})

export default defineConfig({
    plugins: [
        react(),
        buildInjectScript(),
        nodePolyfills({
            include: ['buffer'],
            globals: { Buffer: true }
        }),
        crx({ manifest }),
        zip({ outDir: 'release', outFileName: `${name}-${version}.zip` }),
    ],
    resolve: {
        alias: {
            '@': `${path.resolve(__dirname, 'src')}`,
        },
    },
    build: {
        outDir: 'dist',
    },
    server: {
        cors: {
            origin: [
                /chrome-extension:\/\//,
            ],
        },
    },
});
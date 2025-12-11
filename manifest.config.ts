import { defineManifest } from '@crxjs/vite-plugin'
import pkg from './package.json'

export default defineManifest({
    manifest_version: 3,
    name: pkg.name,
    version: pkg.version,
    icons: {
        16: 'public/logo.png',
        32: 'public/logo.png',
        48: 'public/logo.png',
    },
    action: {
        default_icon: {
            48: 'public/logo.png',
        },
        default_popup: 'src/index.html',
    },
    permissions: ["storage", "activeTab", "scripting", "tabs"],
    background: {
        service_worker: `src/background/index.ts`,
        type: 'module'
    },
    content_security_policy: {
        extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self'"
    },
    content_scripts: [{
        js: ['src/content/content.ts'],
        matches: ["<all_urls>"],
    }],
    web_accessible_resources: [{
        resources: ['src/content/inject.js'],
        matches: ["<all_urls>"],
    }],
})

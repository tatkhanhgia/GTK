// Preload for seed script: loads .env.local + patches @next/env CJS/ESM interop for tsx
// tsx transforms `import X from '@next/env'` to require('@next/env').default
// but @next/env is CJS with no .default — this shim adds it

const fs = require('fs')
const path = require('path')

// 1. Load .env.local into process.env (same as Next.js behavior)
const envPath = path.resolve(process.cwd(), '.env.local')
try {
  const content = fs.readFileSync(envPath, 'utf-8')
  for (const line of content.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIndex = trimmed.indexOf('=')
    if (eqIndex === -1) continue
    const key = trimmed.slice(0, eqIndex).trim()
    const value = trimmed.slice(eqIndex + 1).trim().replace(/^["']|["']$/g, '')
    if (key && !(key in process.env)) process.env[key] = value
  }
} catch { /* .env.local is optional */ }

// 2. Patch @next/env default export for tsx interop
const Module = require('module')
const origLoad = Module._load
Module._load = function (request, parent, isMain) {
  const result = origLoad.call(this, request, parent, isMain)
  if (request === '@next/env' && !result.default) {
    result.default = result
  }
  return result
}

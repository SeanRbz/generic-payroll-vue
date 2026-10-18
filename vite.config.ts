import { existsSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, normalizePath, type Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// Stable per-file seed: the same source always obfuscates to the same bytes, so
// a chunk's file name (hashed before obfuscation) never maps to different code.
function seedFor(fileName: string): number {
  let hash = 0
  for (const char of fileName) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  return hash || 1
}

// Windows (and macOS) filesystems are case-insensitive, so the dev server can
// receive the same file under different casing (`/SRC/...`, a lower-cased drive
// letter) and Vite's own fs.allow check lets it through. A case-sensitive prefix
// check would then fail open and serve that file readable, so compare
// case-insensitively on those platforms. 8.3 short names (`ADMIN~1`) are not
// normalized and stay a known gap in this deterrent.
const caseInsensitiveFs = process.platform === 'win32' || process.platform === 'darwin'
function isUnderSrcDir(path: string, appSrcDir: string): boolean {
  return caseInsensitiveFs
    ? path.toLowerCase().startsWith(appSrcDir.toLowerCase())
    : path.startsWith(appSrcDir)
}

// One option set for both the dev server and release builds, so what you see
// while developing is what ships.
async function obfuscate(code: string, fileName: string): Promise<string> {
  const { default: JavaScriptObfuscator } = await import('javascript-obfuscator')

  return JavaScriptObfuscator.obfuscate(code, {
    sourceType: 'module',
    target: 'browser',
    compact: true,
    identifierNamesGenerator: 'hexadecimal',
    seed: seedFor(fileName),
    // Leaves `import('@/views/pages/X.vue')` calls untouched. Both Vite's dev-time
    // import-analysis (which rewrites the `@/` alias to a server URL) and the
    // bundler's chunk-graph analysis need that specifier as a literal string;
    // obfuscating it replaces the literal with a string-array decode call, so
    // the rewrite/resolution never happens and the lazy route 404s at runtime
    // (the RouterView renders blank while the rest of the shell still works).
    ignoreImports: true,
    // Property names stay intact: Vue props/emits and the Google and Gmail
    // payloads depend on them.
    renameProperties: false,
    renameGlobals: false,
    stringArray: true,
    stringArrayEncoding: ['base64'],
    stringArrayThreshold: 1,
    rotateStringArray: true,
    shuffleStringArray: true,
    controlFlowFlattening: true,
    controlFlowFlatteningThreshold: 0.4,
    // These break legitimate use (DevTools, hot paths, third-party scripts).
    selfDefending: false,
    debugProtection: false,
    disableConsoleOutput: false,
    sourceMap: false,
  }).getObfuscatedCode()
}

// Dev server only. Vite serves each module on its own, so this scrambles our own
// source files (src/**) as they are requested, after Vue and TypeScript have
// been compiled and before Vite rewrites the imports. Dependencies stay as they
// are. The module's source map is emptied: Vite would otherwise embed the
// original source in it and DevTools would show that instead.
//
// Known gap: vite-plugin-vue-devtools bundles vite-plugin-inspect, which keeps
// every transform step (including the pre-obfuscation source) in memory and
// serves it at /__inspect__ and from the Vue DevTools overlay. That is reachable
// by anyone with the dev server open, same as any other dev-only endpoint; it is
// an accepted limit of this deterrent, not a bug to chase here.
function obfuscateDevModules(): Plugin {
  let appSrcDir = ''

  return {
    name: 'obfuscate-dev-modules',
    apply: 'serve',
    enforce: 'post',
    configResolved(config) {
      appSrcDir = `${normalizePath(config.root)}/src/`
      // Fail fast rather than silently serving every module unobfuscated: if this
      // path is ever wrong (a different root resolution, a symlinked project), every
      // request would skip the isUnderSrcDir filter below with no warning at all.
      if (!existsSync(appSrcDir)) {
        throw new Error(`obfuscate-dev-modules: expected source dir not found: ${appSrcDir}`)
      }
    },
    async transform(code, id, options) {
      // Vitest reuses this config and must see plain code.
      if (process.env.VITEST || options?.ssr) return null

      const [path = '', query = ''] = normalizePath(id).split('?')
      if (!isUnderSrcDir(path, appSrcDir) || !/\.(vue|[cm]?[jt]sx?)$/.test(path)) return null
      // Style blocks and ?raw / ?url requests are not scripts; ?raw returns the
      // source as a string value anyway, which obfuscation here can't hide.
      if (/(^|&)(type=style|raw|url)(&|$)/.test(query)) return null

      const obfuscated = await obfuscate(code, path)
      // Vite marks a module "self-accepting" (an edit re-executes just this module
      // instead of walking up to a full reload) by scanning the transformed code for
      // the literal text `import.meta.hot.accept(`. @vitejs/plugin-vue injects that
      // call into every SFC's dev output, but the obfuscator rewrites the literal
      // along with every other identifier, so Vite never finds it and every save
      // here would otherwise fall through to a full page reload — dropping the
      // in-memory Gmail session on every edit. Re-declare a literal, no-op accept()
      // after obfuscation so Vite's scan sees it; Vite's HMR client appends rather
      // than replaces accept() registrations, so the real (still obfuscated, still
      // functional) callback Vue injected keeps running unchanged.
      const code_ = code.includes('import.meta.hot.accept(')
        ? `${obfuscated}\nimport.meta.hot.accept()`
        : obfuscated

      return { code: code_, map: { mappings: '' } }
    },
  }
}

// Release builds only. Scrambles the chunks that contain our own source; the
// vendor chunk (Vue, router) is left alone because it is public code and
// obfuscating it only costs bundle size and speed. This makes the bundle
// harder to read, not impossible: the browser still has to run it.
function obfuscateAppCode(): Plugin {
  let appSrcDir = ''

  return {
    name: 'obfuscate-app-code',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      // Mutating chunk code leaves source maps stale, and a map would ship the
      // original source anyway.
      if (config.build.sourcemap) {
        throw new Error('obfuscate-app-code: build.sourcemap must stay off for release builds')
      }
      appSrcDir = `${normalizePath(config.root)}/src/`
    },
    generateBundle: {
      // Must run after Vite's own generateBundle. `vite:build-import-analysis`
      // turns `__VITE_PRELOAD__` markers into each lazy route's CSS and preload
      // list by parsing literal `import('./X.js')` calls; obfuscating first
      // hides those calls and silently drops that CSS. Obfuscating even earlier
      // (renderChunk) encodes the file-name hash placeholders, so lazy routes 404.
      order: 'post',
      async handler(_options, bundle) {
        let obfuscated = 0

        for (const output of Object.values(bundle)) {
          if (output.type !== 'chunk') continue
          if (!output.moduleIds.some((id) => isUnderSrcDir(normalizePath(id), appSrcDir))) continue
          if (output.code.includes('__VITE_PRELOAD__') || output.code.includes('!~{')) {
            this.error(
              `${output.fileName} still has unresolved build placeholders (plugin ran too early)`,
            )
          }

          output.code = await obfuscate(output.code, output.fileName)
          obfuscated++
        }

        // Fail closed: a path or id change must not quietly ship readable code.
        if (obfuscated === 0) {
          this.error('obfuscate-app-code: no app chunks matched, refusing to ship readable code')
        }
      },
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  // obfuscateDevModules() must stay after vueDevTools(): the inspector's own
  // `createVNode as _createVNode` rewrite needs to see plain code, and it runs
  // earlier in the pipeline only because it is registered first in this array.
  plugins: [vue(), vueDevTools(), tailwindcss(), obfuscateDevModules(), obfuscateAppCode()],
  // .env files live in ./env instead of the project root.
  envDir: 'env',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    sourcemap: false,
    rolldownOptions: {
      output: {
        // Keep third-party code in its own chunk so only our code is obfuscated.
        codeSplitting: {
          groups: [{ name: 'vendor', test: /[\\/]node_modules[\\/]/ }],
        },
      },
    },
  },
})

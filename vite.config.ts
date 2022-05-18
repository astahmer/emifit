import react from "@vitejs/plugin-react";
import jotaiDebugLabel from "jotai/babel/plugin-debug-label";
import jotaiReactRefresh from "jotai/babel/plugin-react-refresh";
import { defineConfig } from "vite";
import { ManifestOptions, VitePWA, VitePWAOptions } from "vite-plugin-pwa";
import checker from "vite-plugin-checker";
import replace from "@rollup/plugin-replace";

const replaceOptions = { __DATE__: new Date().toISOString() };
const pwaOptions: Partial<VitePWAOptions> = {
    mode: "development",
    base: "/",
    // https://github.dev/antfu/vite-plugin-pwa/tree/main/examples
    devOptions: {
        enabled: process.env.SW_DEV === "true",
        /* when using generateSW the PWA plugin will switch to classic */
        type: "module",
        navigateFallback: "index.html",
    },
    includeAssets: ["pwa-512x512.jpeg", "favicon.ico", "robots.txt"],
    registerType: "autoUpdate",
    manifest: {
        name: "EmitFit",
        short_name: "EmitFit",
        description: "Easily keep a track of your daily exercises",
        theme_color: "#FFD3D9",
        icons: [
            // {
            //   src: 'pwa-192x192.png',
            //   sizes: '192x192',
            //   type: 'image/png',
            // },
            {
                src: "pwa-512x512.jpeg",
                sizes: "512x512",
                type: "image/jpeg",
            },
            // {
            //   src: 'pwa-512x512.png',
            //   sizes: '512x512',
            //   type: 'image/png',
            //   purpose: 'any maskable',
            // }
        ],
    },
    workbox: {
        sourcemap: true,
    },
};
const reload = process.env.RELOAD_SW === "true";

if (process.env.SW === "true") {
    pwaOptions.srcDir = "src";
    pwaOptions.filename = "prompt-sw.ts";
    pwaOptions.strategies = "injectManifest";
    (pwaOptions.manifest as Partial<ManifestOptions>).name = "PWA Inject Manifest";
    (pwaOptions.manifest as Partial<ManifestOptions>).short_name = "PWA Inject";
}

if (reload) {
    // @ts-expect-error just ignore
    replaceOptions.__RELOAD_SW__ = "true";
}

// https://vitejs.dev/config/
export default defineConfig({
    base: "/",
    root: "./",
    build: { outDir: "./dist", sourcemap: true },
    plugins: [
        // https://jotai.org/docs/guides/vite
        react({ babel: { plugins: [jotaiDebugLabel, jotaiReactRefresh] } }),
        VitePWA(pwaOptions),
        replace(replaceOptions),
        checker({ typescript: true }),
    ],
    resolve: {
        alias: [
            {
                find: "@",
                replacement: "/src",
            },
        ],
    },
});

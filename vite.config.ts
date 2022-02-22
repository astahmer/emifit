import react from "@vitejs/plugin-react";
import jotaiDebugLabel from "jotai/babel/plugin-debug-label";
import jotaiReactRefresh from "jotai/babel/plugin-react-refresh";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
    base: "/",
    root: "./",
    build: { outDir: "./dist", sourcemap: true },
    plugins: [
        // https://jotai.org/docs/guides/vite
        react({ babel: { plugins: [jotaiDebugLabel, jotaiReactRefresh] } }),
        VitePWA({
            // TODO
            // includeAssets: ['favicon.svg', 'favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
            manifest: {
                name: "EmitFit",
                short_name: "EmitFit",
                description: "Easily keep a track of your daily exercises",
                theme_color: "#FFD3D9",
                //   icons: [
                //     {
                //       src: 'pwa-192x192.png',
                //       sizes: '192x192',
                //       type: 'image/png',
                //     },
                //     {
                //       src: 'pwa-512x512.png',
                //       sizes: '512x512',
                //       type: 'image/png',
                //     },
                //     {
                //       src: 'pwa-512x512.png',
                //       sizes: '512x512',
                //       type: 'image/png',
                //       purpose: 'any maskable',
                //     }
                //   ]
            },
        }),
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

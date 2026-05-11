import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

const manualChunks = (id: string) => {
    if (!id.includes("node_modules")) {
        return undefined;
    }

    if (id.includes("react-router")) return "vendor-router";
    if (id.includes("@tanstack/react-query")) return "vendor-query";
    if (id.includes("framer-motion") || id.includes("gsap")) return "vendor-animation";
    if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
    if (id.includes("@react-pdf") || id.includes("fontkit") || id.includes("pdfkit")) return "vendor-pdf";
    if (id.includes("lucide-react")) return "vendor-icons";
    if (id.includes("axios") || id.includes("zustand") || id.includes("js-cookie")) return "vendor-data";
    if (id.includes("react") || id.includes("react-dom") || id.includes("scheduler")) return "vendor-react";

    return "vendor";
};

// https://vite.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    build: {
        rollupOptions: {
            output: {
                manualChunks,
            },
        },
    },
});

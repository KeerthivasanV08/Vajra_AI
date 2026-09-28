// Keep the Lovable development helpers while targeting Vercel Functions through Nitro.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  if (mode === "production" && !env.VITE_API_URL?.trim()) {
    throw new Error("VITE_API_URL must be configured for production builds.");
  }

  return {
    cloudflare: false,
    plugins: [nitro()],
  };
});

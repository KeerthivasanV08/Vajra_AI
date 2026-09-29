// Keep the Lovable development helpers while targeting Vercel Functions through Nitro.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";
import { loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiUrl = env.VITE_API_URL?.trim() ?? "";
  const isLocalApiUrl = /^(https?:\/\/)?(127\.0\.0\.1|localhost)(:\d+)?(?:\/|$)/i.test(apiUrl);

  if (mode === "production" && (!apiUrl || isLocalApiUrl)) {
    throw new Error("VITE_API_URL must be a deployed backend origin for production builds.");
  }

  return {
    cloudflare: false,
    plugins: [nitro()],
  };
});

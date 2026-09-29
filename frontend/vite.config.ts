// Keep the Lovable development helpers while targeting Vercel Functions through Nitro.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { nitro } from "nitro/vite";
import { loadEnv } from "vite";

const PRODUCTION_API_URL = "https://vajra-ai-sh9c.onrender.com";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  let apiUrl = env.VITE_API_URL?.trim() ?? "";
  const isLocalApiUrl = /^(https?:\/\/)?(127\.0\.0\.1|localhost)(:\d+)?(?:\/|$)/i.test(apiUrl);

  if (mode === "production" && (!apiUrl || isLocalApiUrl)) {
    apiUrl = PRODUCTION_API_URL;
    process.env.VITE_API_URL = PRODUCTION_API_URL;
  }

  return {
    cloudflare: false,
    plugins: [nitro()],
    define: {
      "import.meta.env.VITE_API_URL": JSON.stringify(apiUrl || PRODUCTION_API_URL),
    },
  };
});

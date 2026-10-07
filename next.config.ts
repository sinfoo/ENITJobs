import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Local-first app: every page reads the local SQLite DB, so nothing is
  // statically cacheable. Keep the classic dynamic rendering model.
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

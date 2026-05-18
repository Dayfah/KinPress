import type { NextConfig } from "next";

import { assertProductionEnvForBuild } from "./src/lib/env/validate";

assertProductionEnvForBuild();

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/article/:slug",
        destination: "/articles/:slug",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

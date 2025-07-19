/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    // RESOURCE_WALLET_ADDRESS: process.env.RESOURCE_WALLET_ADDRESS,
    // NEXT_PUBLIC_FACILITATOR_URL: process.env.NEXT_PUBLIC_FACILITATOR_URL,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    return config;
  },
  async redirects() {
    return [
      {
        source: "/.well-known/farcaster.json",
        destination:
          "https://api.farcaster.xyz/miniapps/hosted-manifest/01982170-96e8-8ba5-92ba-6d98d6dff0f8",
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;

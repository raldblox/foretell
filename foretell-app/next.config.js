/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    SEQUENCE_PROJECT_KEY: process.env.SEQUENCE_PROJECT_KEY,
    SEQUENCE_WAAS_KEY: process.env.SEQUENCE_WAAS_KEY,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });
    config.externals.push("pino-pretty", "lokijs", "encoding");
    return config;
  },
  // async redirects() {
  //   return [
  //     {
  //       source: "/.well-known/farcaster.json",
  //       destination:
  //         "https://api.farcaster.xyz/miniapps/hosted-manifest/01982170-96e8-8ba5-92ba-6d98d6dff0f8",
  //       permanent: false,
  //     },
  //   ];
  // },
};

module.exports = nextConfig;

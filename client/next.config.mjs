/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      "socialface.s3.eu-north-1.amazonaws.com",
      "s3.eu-north-1.amazonaws.com",
      "ayoob.ecom.s3.eu-north-1.amazonaws.com",
    ],
    domains: ["cdn.shopify.com"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "socialface.s3.eu-north-1.amazonaws.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "s3.eu-north-1.amazonaws.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;

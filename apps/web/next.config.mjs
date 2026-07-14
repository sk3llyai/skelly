/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Let Next transpile our workspace packages directly from their build output.
  transpilePackages: ['@skelly/domain-contracts'],
};

export default nextConfig;

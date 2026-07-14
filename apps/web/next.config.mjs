import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Produce a self-contained server bundle for containers.
  output: 'standalone',
  // In a monorepo, trace files from the repo root so the standalone output is complete.
  outputFileTracingRoot: path.join(dirname, '../../'),
  // Let Next transpile our workspace packages directly from their build output.
  transpilePackages: ['@skelly/domain-contracts'],
};

export default nextConfig;

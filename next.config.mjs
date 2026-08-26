/** @type {import('next').NextConfig} */
const nextConfig = {
  // 'standalone' is for self-hosting (Docker/bare-metal). On Vercel it conflicts
  // with the platform's own file tracing (missing .nft.json), so skip it there.
  output: process.env.VERCEL ? undefined : 'standalone',
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Prevent Turbopack (dev) from bundling pino's transport packages.
  // Without this, thread-stream is compiled with virtual /ROOT/... paths that
  // don't exist on disk, so its worker thread spawn fails at runtime.
  serverExternalPackages: ['pino', 'pino-pretty', 'thread-stream'],
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Mark thread-stream as external to prevent webpack from bundling
      // its non-code files (LICENSE, test artifacts, etc) that cause build failures.
      // thread-stream is only used at runtime by pino's transport layer, never needed at build time.
      config.externals = [...(config.externals || []), 'thread-stream']
    }
    return config
  },
}

export default nextConfig

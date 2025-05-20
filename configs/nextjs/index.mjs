import { PrismaPlugin } from '@prisma/nextjs-monorepo-workaround-plugin'

/** @type {import('next').NextConfig} */
export const nextDefaultConfig = {
  reactStrictMode: true,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  experimental: {
    serverActions: {
      allowedOrigins: [
        'babylon.l2scan.co',
      ],
    },
  },
  transpilePackages: [
    '@cosmoscan/core-api',
    '@cosmoscan/core-db',
    '@cosmoscan/shared',
    '@cosmoscan/ui',
  ],
  env: Object.keys(process.env).reduce((env, key) => {
    key.startsWith('COSMOSCAN_PUBLIC_') && (env[key] = process.env[key])
    return env
  }, {}),
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ]
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.plugins = [...config.plugins, new PrismaPlugin()]
    }

    config.externals.push('pino-pretty', 'lokijs', 'encoding', {
      'node-gyp-build': 'commonjs node-gyp-build',
    })

    return config
  },
}

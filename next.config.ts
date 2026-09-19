import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.igdb.com',
        pathname: '/igdb/image/upload/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-a307d52a91bd4744abc9e09f849ad9f1.r2.dev',
        pathname: '/consoles-assets/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-a307d52a91bd4744abc9e09f849ad9f1.r2.dev',
        pathname: '/engines-assets/**',
      },
      // YouTube video thumbnails for the media gallery (IGDB videos are YouTube ids).
      {
        protocol: 'https',
        hostname: 'img.youtube.com',
        pathname: '/vi/**',
      },
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        pathname: '/vi/**',
      },
    ],
  },
}

export default nextConfig

import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${process.env.COSMOSCAN_PUBLIC_WEBSITE_BASE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${process.env.COSMOSCAN_PUBLIC_WEBSITE_BASE_URL}/transactions`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${process.env.COSMOSCAN_PUBLIC_WEBSITE_BASE_URL}/staking-transactions`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${process.env.COSMOSCAN_PUBLIC_WEBSITE_BASE_URL}/blocks`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${process.env.COSMOSCAN_PUBLIC_WEBSITE_BASE_URL}/finality-providers`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${process.env.COSMOSCAN_PUBLIC_WEBSITE_BASE_URL}/validators`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
   
  ]
}

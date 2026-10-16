import type { MetadataRoute } from 'next'

import { env } from '@/lib/config/env'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: '*', allow: '/', disallow: '/api/' },
      {
        // Exclude known AI training, search, and user-requested fetch agents.
        // This is voluntary crawler policy, not an enforced access restriction.
        // Keep Googlebot, Bingbot, and other general search crawlers allowed.
        userAgent: [
          'ClaudeBot',
          'Claude-SearchBot',
          'Claude-User',
          'anthropic-ai',
          'GPTBot',
          'OAI-SearchBot',
          'ChatGPT-User',
          'PerplexityBot',
          'Perplexity-User',
          'Google-Extended',
          'Google-CloudVertexBot',
          'Applebot-Extended',
          'meta-externalagent',
          'meta-externalfetcher',
          'FacebookBot',
          'Amazonbot',
          'Amzn-SearchBot',
          'Amzn-User',
          'MistralAI-Training',
          'MistralAI-Index',
          'MistralAI-User',
          'cohere-ai',
          'cohere-training-data-crawler',
          'Bytespider',
          'CCBot',
          'AI2Bot',
          'Diffbot',
          'YouBot',
          'DuckAssistBot',
        ],
        disallow: '/',
      },
    ],
    sitemap: `${env.siteUrl}/sitemap-index.xml`,
  }
}

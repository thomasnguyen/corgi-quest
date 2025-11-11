/**
 * Cloudflare Worker for fetching dog training tips via Firecrawl
 * 
 * This worker acts as an edge proxy between your app and Firecrawl API,
 * providing caching and rate limiting benefits.
 * 
 * Deploy with: wrangler deploy
 */

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    try {
      const url = new URL(request.url);
      const topic = url.searchParams.get('topic') || 'dog training';
      
      // Get Firecrawl API key from environment variable
      const firecrawlApiKey = env.FIRECRAWL_API_KEY;
      if (!firecrawlApiKey) {
        return new Response(
          JSON.stringify({ error: 'FIRECRAWL_API_KEY not configured' }),
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Build target URL based on topic
      const targetUrl = getTrainingUrl(topic);

      // Call Firecrawl API
      const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${firecrawlApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: targetUrl,
          formats: ['markdown'],
          onlyMainContent: true,
        }),
      });

      if (!firecrawlResponse.ok) {
        const errorText = await firecrawlResponse.text();
        console.error('Firecrawl API error:', errorText);
        return new Response(
          JSON.stringify({ 
            error: 'Failed to fetch from Firecrawl',
            details: errorText,
          }),
          { 
            status: firecrawlResponse.status,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      const data = await firecrawlResponse.json();
      
      // Parse and format tip from markdown
      const tip = parseTrainingTip(data, topic);

      return new Response(JSON.stringify(tip), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400', // Cache for 1 hour, stale for 24h
        },
      });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Internal server error',
          message: error instanceof Error ? error.message : 'Unknown error',
        }),
        { 
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      );
    }
  },
};

/**
 * Get training URL based on topic
 */
function getTrainingUrl(topic: string): string {
  const topicMap: Record<string, string> = {
    'basic-training': 'https://www.akc.org/expert-advice/training/basic-training/',
    'socialization': 'https://www.akc.org/expert-advice/training/socialization/',
    'impulse-control': 'https://www.akc.org/expert-advice/training/impulse-control/',
    'puppy-training': 'https://www.akc.org/expert-advice/training/puppy-training/',
    'obedience': 'https://www.akc.org/expert-advice/training/obedience/',
  };

  return topicMap[topic.toLowerCase()] || 'https://www.akc.org/expert-advice/training/';
}

/**
 * Parse training tip from Firecrawl response
 */
function parseTrainingTip(data: any, topic: string) {
  const markdown = data.markdown || data.data?.markdown || '';
  
  // Extract title (first H1 or H2)
  const titleMatch = markdown.match(/^#+\s+(.+)$/m);
  const title = titleMatch?.[1] || `Dog Training: ${topic}`;

  // Extract description (first paragraph after title)
  const paragraphs = markdown.split('\n\n').filter(p => p.trim().length > 50);
  const description = paragraphs[0]?.replace(/^#+\s+.*$/m, '').trim() || 
                      markdown.substring(0, 200) + '...';

  // Extract key points (bullet points)
  const bulletPoints = markdown
    .split('\n')
    .filter(line => line.trim().startsWith('-') || line.trim().startsWith('*'))
    .slice(0, 3)
    .map(line => line.replace(/^[-*]\s+/, '').trim());

  return {
    title,
    description: description.substring(0, 500), // Limit description length
    keyPoints: bulletPoints,
    source: 'AKC',
    topic,
    fetchedAt: new Date().toISOString(),
  };
}

// TypeScript interface for environment variables
interface Env {
  FIRECRAWL_API_KEY: string;
}


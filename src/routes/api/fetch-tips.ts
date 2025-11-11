/**
 * TanStack Start Server Function for fetching training tips
 * 
 * This function calls the Cloudflare Worker, which in turn calls Firecrawl API.
 * This creates a "sponsor synergy" between Cloudflare and Firecrawl.
 * 
 * Usage in components:
 *   import { fetchTrainingTips } from '@/routes/api/fetch-tips'
 *   const tips = await fetchTrainingTips({ topics: ['basic-training'] })
 */

import { createServerFn } from '@tanstack/react-start';

interface TrainingTip {
  title: string;
  description: string;
  keyPoints: string[];
  source: string;
  topic: string;
  fetchedAt: string;
}

interface FetchTipsOptions {
  topics?: string[];
}

export const fetchTrainingTips = createServerFn({
  method: 'GET',
})
  .inputValidator((data: FetchTipsOptions) => data || {})
  .handler(async ({ data }) => {
    const workerUrl = process.env.CLOUDFLARE_WORKER_URL;
    
    if (!workerUrl) {
      console.warn('CLOUDFLARE_WORKER_URL not set, returning fallback tips');
      return getFallbackTips(data?.topics || []);
    }

    const topics = data?.topics || [
      'basic-training',
      'socialization',
      'impulse-control',
    ];

    const tips: TrainingTip[] = [];

    // Fetch tips from Cloudflare Worker in parallel
    const tipPromises = topics.map(async (topic) => {
      try {
        const response = await fetch(`${workerUrl}?topic=${encodeURIComponent(topic)}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          console.error(`Failed to fetch tip for topic "${topic}":`, response.statusText);
          return null;
        }

        const tip = await response.json();
        return tip as TrainingTip;
      } catch (error) {
        console.error(`Error fetching tip for topic "${topic}":`, error);
        return null;
      }
    });

    const results = await Promise.all(tipPromises);
    
    // Filter out null results and add to tips array
    results.forEach((tip) => {
      if (tip) {
        tips.push(tip);
      }
    });

    // If no tips were fetched, return fallback
    if (tips.length === 0) {
      console.warn('No tips fetched from Cloudflare Worker, using fallback');
      return getFallbackTips(topics);
    }

    return tips;
  });

/**
 * Fallback tips if Cloudflare Worker or Firecrawl is unavailable
 */
function getFallbackTips(topics: string[]): TrainingTip[] {
  const fallbackTips: Record<string, TrainingTip> = {
    'basic-training': {
      title: 'Basic Dog Training Fundamentals',
      description: 'Start with simple commands like sit, stay, and come. Use positive reinforcement with treats and praise. Keep training sessions short (5-10 minutes) and consistent.',
      keyPoints: [
        'Use positive reinforcement',
        'Keep sessions short and fun',
        'Be consistent with commands',
      ],
      source: 'AKC',
      topic: 'basic-training',
      fetchedAt: new Date().toISOString(),
    },
    'socialization': {
      title: 'Socializing Your Dog',
      description: 'Expose your dog to different people, places, and situations early. Start with controlled environments and gradually increase exposure. Always monitor your dog\'s comfort level.',
      keyPoints: [
        'Start early and gradually',
        'Use positive experiences',
        'Monitor your dog\'s comfort',
      ],
      source: 'AKC',
      topic: 'socialization',
      fetchedAt: new Date().toISOString(),
    },
    'impulse-control': {
      title: 'Teaching Impulse Control',
      description: 'Help your dog learn to wait and resist temptation. Practice "wait" and "leave it" commands. Use high-value treats to reinforce self-control behaviors.',
      keyPoints: [
        'Practice "wait" and "leave it"',
        'Use high-value rewards',
        'Build up difficulty gradually',
      ],
      source: 'AKC',
      topic: 'impulse-control',
      fetchedAt: new Date().toISOString(),
    },
  };

  return topics
    .map((topic) => fallbackTips[topic])
    .filter((tip): tip is TrainingTip => tip !== undefined);
}

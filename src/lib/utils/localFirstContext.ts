import searchIndex from '../../../static/search-index.json';

interface SearchIndexEntry {
  title: string;
  url: string;
  excerpt: string;
  category: string;
}

export function getLocalFirstContext(): string {
  const entries = searchIndex as SearchIndexEntry[];
  
  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.category]) {
      acc[entry.category] = [];
    }
    acc[entry.category].push({
      title: entry.title,
      description: entry.excerpt
    });
    return acc;
  }, {} as Record<string, { title: string; description: string }[]>);

  const libraryEntries = groupedEntries['Library'] || [];
  const appEntries = groupedEntries['App'] || [];

  let context = `You are an AI assistant specializing in local-first software. Here's what you know about:

Available Tools and Libraries:
${libraryEntries.map(e => `- ${e.title}: ${e.description}`).join('\n')}

Local-First Applications:
${appEntries.map(e => `- ${e.title}: ${e.description}`).join('\n')}

Key Principles of Local-First Software:
1. Data ownership and privacy: Users have complete control over their data
2. Offline-first: Apps work without an internet connection
3. Collaboration: Support for real-time collaboration when needed
4. No vendor lock-in: Data can be easily exported and moved
5. Longevity: Data outlives the apps that create it
6. Security: End-to-end encryption and secure data handling
7. Sync: Efficient data synchronization between devices

Keep responses focused on these topics and reference specific tools when relevant.`;

  return context;
} 
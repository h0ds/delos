const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 300 });

async function fetchNewsAPI(query) {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        apiKey,
        q: query,
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 20
      }
    });

    return response.data.articles.map(article => ({
      source: article.source?.name || 'News',
      title: article.title,
      summary: article.description,
      date: article.publishedAt,
      url: article.url,
      category: 'news',
      impact: calculateImpact(article.title),
      sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
      relatedMarkets: extractMarkets(query, article.title)
    }));
  } catch (error) {
    console.error('[newsapi]', error.message);
    return [];
  }
}

async function fetchGoogleNews(query) {
  try {
    const response = await axios.get('https://news.google.com/rss/search', {
      params: { q: query, hl: 'en-US', gl: 'US', ceid: 'US:en' },
      headers: { 'Accept': 'application/rss+xml' }
    });

    const items = parseRSS(response.data);
    return items.slice(0, 15).map(item => ({
      source: 'Google News',
      title: cleanTitle(item.title),
      summary: item.description,
      date: item.pubDate,
      url: item.link,
      category: 'news',
      impact: calculateImpact(item.title),
      sentiment: analyzeSentiment(item.title),
      relatedMarkets: extractMarkets(query, item.title)
    }));
  } catch (error) {
    console.error('[google-news]', error.message);
    return [];
  }
}

async function fetchReddit(query) {
  try {
    const response = await axios.get('https://www.reddit.com/search.json', {
      params: { q: query, sort: 'new', limit: 15 },
      headers: { 'User-Agent': 'sigint/1.0' }
    });

    return response.data.data.children.map(post => ({
      source: `r/${post.data.subreddit}`,
      title: post.data.title,
      summary: post.data.selftext?.substring(0, 200) || null,
      date: new Date(post.data.created_utc * 1000).toISOString(),
      url: `https://reddit.com${post.data.permalink}`,
      category: 'social',
      impact: Math.min(post.data.score / 500, 1),
      sentiment: analyzeSentiment(post.data.title),
      relatedMarkets: extractMarkets(query, post.data.title)
    }));
  } catch (error) {
    console.error('[reddit]', error.message);
    return [];
  }
}

function parseRSS(xml) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    items.push({
      title: extractTag(match[1], 'title'),
      link: extractTag(match[1], 'link'),
      description: extractTag(match[1], 'description'),
      pubDate: extractTag(match[1], 'pubDate')
    });
  }
  return items;
}

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`);
  const match = regex.exec(xml);
  return match ? (match[1] || match[2] || '').trim() : '';
}

function cleanTitle(title) {
  return title?.replace(/ - [^-]+$/, '').trim() || title;
}

function calculateImpact(text) {
  if (!text) return 0.3;
  const lower = text.toLowerCase();
  
  const high = ['breaking', 'urgent', 'crash', 'surge', 'plunge', 'record', 'historic', 'halt', 'emergency'];
  const med = ['rise', 'fall', 'gain', 'drop', 'announce', 'report', 'reveal', 'confirm'];
  
  let score = 0.2;
  high.forEach(w => { if (lower.includes(w)) score += 0.25; });
  med.forEach(w => { if (lower.includes(w)) score += 0.1; });
  
  return Math.min(score, 1);
}

function analyzeSentiment(text) {
  if (!text) return 0;
  const lower = text.toLowerCase();
  
  const positive = ['surge', 'gain', 'rise', 'win', 'success', 'growth', 'boost', 'rally', 'bullish', 'soar', 'jump'];
  const negative = ['crash', 'fall', 'drop', 'lose', 'fail', 'decline', 'plunge', 'bearish', 'sink', 'tank', 'risk', 'fear'];
  
  let score = 0;
  positive.forEach(w => { if (lower.includes(w)) score += 0.2; });
  negative.forEach(w => { if (lower.includes(w)) score -= 0.2; });
  
  return Math.max(-1, Math.min(1, score));
}

function extractMarkets(query, title) {
  const markets = [];
  const text = (query + ' ' + (title || '')).toLowerCase();
  
  const keywords = {
    'BTC': ['bitcoin', 'btc'],
    'ETH': ['ethereum', 'eth'],
    'SPX': ['s&p', 'sp500', 'stock market'],
    'ELECTION': ['election', 'trump', 'biden', 'democrat', 'republican'],
    'FED': ['federal reserve', 'fed', 'interest rate', 'fomc'],
    'OIL': ['oil', 'crude', 'opec'],
    'GOLD': ['gold', 'precious metal'],
    'TECH': ['nvidia', 'apple', 'google', 'microsoft', 'ai']
  };
  
  Object.entries(keywords).forEach(([market, kws]) => {
    if (kws.some(kw => text.includes(kw))) markets.push(market);
  });
  
  return markets.slice(0, 3);
}

async function acquireSignals(query) {
  const cacheKey = `sig_${query.toLowerCase().replace(/\s+/g, '_')}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const [news, google, reddit] = await Promise.all([
    fetchNewsAPI(query),
    fetchGoogleNews(query),
    fetchReddit(query)
  ]);

  let signals = [...news, ...google, ...reddit];

  signals.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const seen = new Set();
  signals = signals.filter(s => {
    const key = s.title?.toLowerCase().substring(0, 40);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  cache.set(cacheKey, signals);
  return signals;
}

module.exports = { acquireSignals };

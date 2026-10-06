const NEWS_ENDPOINT = 'https://newsapi.org/v2/everything';
const CACHE_TTL_MS = 15 * 60 * 1000; // protect the NewsAPI daily request quota

// Two focused searches: conflict/conservation topics, and species/forest-department news.
const SEARCH_QUERIES = [
  '("human-wildlife conflict" OR "man-animal conflict" OR "wildlife conservation" OR "wildlife protection" OR "tiger reserve" OR "elephant corridor" OR "forest department") AND (India OR Indian)',
  '(elephant OR tiger OR leopard OR "wild animal" OR "wildlife sanctuary" OR "national park") AND (India OR Karnataka OR Kerala OR Assam OR Odisha OR "Tamil Nadu" OR Uttarakhand OR Maharashtra OR "Madhya Pradesh")',
];

// An article must be about wildlife AND be about India to be shown.
const WILDLIFE_REGEX = /(wildlife|wild animal|human[- ]wildlife|man[- ]animal|elephant|tusker|jumbo|tiger|tigress|leopard|panther|sloth bear|bear attack|rhino|gaur|bustard|forest (department|officials?|guards?|rangers?)|tiger reserve|national park|wildlife sanctuary|poaching|crop raid)/i;
const INDIA_REGEX = /(india|indian|karnataka|kerala|assam|odisha|tamil nadu|uttarakhand|maharashtra|madhya pradesh|chhattisgarh|jharkhand|west bengal|bengal|arunachal|meghalaya|nagaland|mizoram|manipur|tripura|sikkim|uttar pradesh|bihar|rajasthan|gujarat|andhra|telangana|goa|himachal|haryana|punjab|kashmir|ladakh|delhi|mumbai|bengaluru|bangalore|chennai|kolkata|hyderabad|moefcc|project tiger|project elephant|corbett|kaziranga|bandipur|nagarhole|ranthambore|sundarban|gir )/i;
// Filter out obvious off-topic noise (finance, entertainment, etc.).
const NOISE_REGEX = /(stock|share price|ipo|sensex|nifty|box office|movie|film|cricket|ipl|bollywood|netflix)/i;

let cache = { data: null, expiresAt: 0 };

const fetchQuery = async (q, apiKey) => {
  const params = new URLSearchParams({
    q,
    language: 'en',
    sortBy: 'publishedAt',
    pageSize: '50',
    apiKey,
  });
  const response = await fetch(`${NEWS_ENDPOINT}?${params.toString()}`);
  const body = await response.json();
  if (body.status !== 'ok') {
    const err = new Error(body.message || 'News provider error');
    err.code = body.code;
    throw err;
  }
  return body.articles || [];
};

export const getWildlifeNews = async (req, res) => {
  const apiKey = process.env.NEWS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'NEWS_API_KEY is not configured on the server.' });
  }

  if (cache.data && cache.expiresAt > Date.now()) {
    return res.json(cache.data);
  }

  try {
    const results = await Promise.allSettled(SEARCH_QUERIES.map((q) => fetchQuery(q, apiKey)));
    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    if (fulfilled.length === 0) {
      throw results[0].reason;
    }

    const seen = new Set();
    const articles = fulfilled
      .flatMap((r) => r.value)
      .filter((a) => a && a.title && a.url && a.title !== '[Removed]')
      .filter((a) => {
        const text = `${a.title} ${a.description || ''}`;
        return WILDLIFE_REGEX.test(text) && INDIA_REGEX.test(`${text} ${a.source?.name || ''} ${a.url}`) && !NOISE_REGEX.test(a.title);
      })
      .filter((a) => {
        const key = a.url;
        const titleKey = a.title.toLowerCase();
        if (seen.has(key) || seen.has(titleKey)) return false;
        seen.add(key);
        seen.add(titleKey);
        return true;
      })
      .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt))
      .slice(0, 12)
      .map((a) => ({
        title: a.title,
        description: a.description,
        url: a.url,
        image: a.urlToImage,
        source: a.source?.name,
        publishedAt: a.publishedAt,
      }));

    cache = { data: articles, expiresAt: Date.now() + CACHE_TTL_MS };
    res.json(articles);
  } catch (error) {
    console.error('News fetch failed:', error.message);
    // Serve stale cache if the provider fails (e.g. rate limit reached)
    if (cache.data) return res.json(cache.data);
    res.status(502).json({ error: 'Unable to load news right now.' });
  }
};

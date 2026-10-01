const discoveryRepository = require("../persistence/discoveryRepository");
const { getCache, setCache } = require("../utils/redisCache");
const redisConnection = require("../config/redisConnection");

const SEARCH_CACHE_TTL = 60;
const SEARCH_CACHE_VERSION_KEY = "job-search:version";

const calculateScore = (job, search) => {
  if (!search) return 0;

  const keyword = search.toLowerCase();
  let score = 0;

  if (job.title.toLowerCase().includes(keyword)) score += 10;
  if (job.description.toLowerCase().includes(keyword)) score += 5;

  for (const threshold of job.thresholds) {
    if (threshold.competency.name.toLowerCase().includes(keyword)) score += 8;
    if (threshold.competency.code.toLowerCase().includes(keyword)) score += 8;
  }

  return score;
};

const getSearchCacheVersion = async () => {
  try {
    const version = await redisConnection.get(SEARCH_CACHE_VERSION_KEY);

    if (version) {
      return version;
    }

    await redisConnection.set(SEARCH_CACHE_VERSION_KEY, "1");
    return "1";
  } catch (error) {
    console.error("Job search cache version error:", error.message);
    return "1";
  }
};

const buildSearchCacheKey = (version, { search, location, employmentType }) => {
  return `job-search:${version}:${JSON.stringify({
    search: search || "",
    location: location || "",
    employmentType: employmentType || "",
  })}`;
};

const searchJobs = async ({ search, location, employmentType }) => {
  const version = await getSearchCacheVersion();

  const cacheKey = buildSearchCacheKey(version, {
    search,
    location,
    employmentType,
  });

  const cachedJobs = await getCache(cacheKey);

  if (cachedJobs) {
    return cachedJobs;
  }

  const jobs = await discoveryRepository.searchJobs({
    search,
    location,
    employmentType,
  });

  const rankedJobs = jobs
    .map((job) => ({
      ...job,
      relevanceScore: calculateScore(job, search),
    }))
    .sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }

      return new Date(b.publishedAt) - new Date(a.publishedAt);
    });

  await setCache(cacheKey, rankedJobs, SEARCH_CACHE_TTL);

  return rankedJobs;
};

module.exports = {
  searchJobs,
  SEARCH_CACHE_VERSION_KEY,
};
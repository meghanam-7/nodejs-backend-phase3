const discoveryRepository = require("../persistence/discoveryRepository");

const calculateScore = (job, search) => {
  if (!search) {
    return 0;
  }

  const keyword = search.toLowerCase();

  let score = 0;

  if (job.title.toLowerCase().includes(keyword)) {
    score += 10;
  }

  if (job.description.toLowerCase().includes(keyword)) {
    score += 5;
  }

  for (const threshold of job.thresholds) {
    if (
      threshold.competency.name
        .toLowerCase()
        .includes(keyword)
    ) {
      score += 8;
    }

    if (
      threshold.competency.code
        .toLowerCase()
        .includes(keyword)
    ) {
      score += 8;
    }
  }

  return score;
};

const searchJobs = async ({
  search,
  location,
  employmentType,
}) => {
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

      return (
        new Date(b.publishedAt) -
        new Date(a.publishedAt)
      );
    });

  return rankedJobs;
};

module.exports = {
  searchJobs,
};
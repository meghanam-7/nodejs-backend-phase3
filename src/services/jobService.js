const jobRepository = require("../persistence/jobRepository");
const {
  validateThresholdLevel,
  evaluateThresholds,
} = require("./thresholdRulesEngine");
const {
  generateAssessmentToken,
} = require("./assessmentService");

const getCompanyForUser = async (userId) => {
  const company = await jobRepository.findCompanyByOwner(userId);

  if (!company) {
    throw new Error("Company profile not found for this user");
  }

  return company;
};

const createJob = async (userId, payload) => {
  const company = await getCompanyForUser(userId);

  const {
    title,
    description,
    location,
    employmentType,
    skillThresholds,
  } = payload;

  if (!skillThresholds || skillThresholds.length === 0) {
    throw new Error("At least one skill threshold is required");
  }

  for (const threshold of skillThresholds) {
    if (!validateThresholdLevel(threshold.minimumLevel)) {
      throw new Error(
        `Minimum level for competency ${threshold.competencyId} must be between 1 and 100`
      );
    }
  }

  const competencyIds = [
    ...new Set(
      skillThresholds.map(
        (threshold) => threshold.competencyId
      )
    ),
  ];

  const competencies =
    await jobRepository.findCompetenciesByIds(competencyIds);

  if (competencies.length !== competencyIds.length) {
    throw new Error("One or more competency IDs are invalid");
  }

  const assessmentToken = generateAssessmentToken();

  return jobRepository.createJob(company.id, {
    title,
    description,
    location,
    employmentType,
    skillThresholds,
    assessmentToken,
  });
};

const getCompanyJobs = async (userId) => {
  const company = await getCompanyForUser(userId);

  return jobRepository.findCompanyJobs(company.id);
};

const getCompanyJob = async (userId, jobId) => {
  const company = await getCompanyForUser(userId);

  const job = await jobRepository.findCompanyJob(
    company.id,
    jobId
  );

  if (!job) {
    throw new Error("Job not found");
  }

  return job;
};

const evaluateJob = async (
  userId,
  jobId,
  candidateSkills
) => {
  const company = await getCompanyForUser(userId);

  const job = await jobRepository.findCompanyJob(
    company.id,
    jobId
  );

  if (!job) {
    throw new Error("Job not found");
  }

  return evaluateThresholds(
    job.thresholds,
    candidateSkills
  );
};

module.exports = {
  createJob,
  getCompanyJobs,
  getCompanyJob,
  evaluateJob,
};
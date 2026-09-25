const prisma = require("../config/prismaClient");

const findCompanyByOwner = async (ownerUserId) => {
  return prisma.company.findUnique({
    where: {
      ownerUserId,
    },
  });
};

const findCompetenciesByIds = async (ids) => {
  return prisma.competency.findMany({
    where: {
      id: {
        in: ids,
      },
    },
  });
};

const createJob = async (companyId, data) => {
  return prisma.job.create({
    data: {
      companyId,
      title: data.title,
      description: data.description,
      location: data.location,
      employmentType: data.employmentType,
      status: "PUBLISHED",
      publishedAt: new Date(),

      thresholds: {
        create: data.skillThresholds.map((threshold) => ({
          competencyId: threshold.competencyId,
          minimumLevel: threshold.minimumLevel,
        })),
      },

      assessments: {
        create: {
          token: data.assessmentToken,
          status: "ACTIVE",
        },
      },
    },

    include: {
      thresholds: {
        include: {
          competency: true,
        },
      },
      assessments: true,
    },
  });
};

const findCompanyJobs = async (companyId) => {
  return prisma.job.findMany({
    where: {
      companyId,
    },
    include: {
      thresholds: {
        include: {
          competency: true,
        },
      },
      assessments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const findCompanyJob = async (companyId, jobId) => {
  return prisma.job.findFirst({
    where: {
      id: jobId,
      companyId,
    },
    include: {
      thresholds: {
        include: {
          competency: true,
        },
      },
      assessments: true,
    },
  });
};

module.exports = {
  findCompanyByOwner,
  findCompetenciesByIds,
  createJob,
  findCompanyJobs,
  findCompanyJob,
};
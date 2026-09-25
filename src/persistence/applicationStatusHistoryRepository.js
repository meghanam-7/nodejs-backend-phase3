const prisma = require("../config/prismaClient");

const createStatusHistory = async (
  applicationId,
  status
) => {
  return prisma.applicationStatusHistory.create({
    data: {
      applicationId,
      status,
    },
  });
};

const findHistoryByApplicationId = async (
  applicationId
) => {
  return prisma.applicationStatusHistory.findMany({
    where: {
      applicationId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

const findLatestStatusHistory = async (
  applicationId
) => {
  return prisma.applicationStatusHistory.findFirst({
    where: {
      applicationId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};



module.exports = {
  createStatusHistory,
  findHistoryByApplicationId,
  findLatestStatusHistory,
};
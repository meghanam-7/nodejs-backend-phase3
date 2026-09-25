const prisma = require("../config/prismaClient");

const findApplicationById = async (applicationId) => {
  return prisma.application.findUnique({
    where: {
      id: applicationId,
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      job: {
        select: {
          id: true,
          title: true,
          companyId: true,
        },
      },
    },
  });
};

const findOfferByApplicationId = async (applicationId) => {
  return prisma.offer.findUnique({
    where: {
      applicationId,
    },
  });
};

const findOfferById = async (offerId) => {
  return prisma.offer.findUnique({
    where: {
      id: offerId,
    },
    include: {
      application: {
        select: {
          id: true,
          status: true,
          job: {
            select: {
              id: true,
              companyId: true,
              title: true,
            },
          },
        },
      },
    },
  });
};

const createOffer = async (data) => {
  return prisma.offer.create({
    data: {
      applicationId: data.applicationId,
      studentId: data.studentId,
      jobId: data.jobId,
      compensation: data.compensation,
      currency: data.currency,
      joiningDate: data.joiningDate,
      status: data.status,
      documentUrl: data.documentUrl,
      eSignProvider: data.eSignProvider,
      eSignStatus: data.eSignStatus,
      eSignRequestId: data.eSignRequestId,
      signedHash: data.signedHash,
    },
  });
};

const updateOffer = async (offerId, data) => {
  return prisma.offer.update({
    where: {
      id: offerId,
    },
    data,
  });
};

const findOffersByStudentId = async (studentId) => {
  return prisma.offer.findMany({
    where: {
      studentId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const findOffersByJobId = async (jobId) => {
  return prisma.offer.findMany({
    where: {
      jobId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const findCompanyByOwner = async (ownerUserId) => {
  return prisma.company.findUnique({
    where: {
      ownerUserId,
    },
    select: {
      id: true,
      name: true,
    },
  });
};

const findJobById = async (jobId) => {
  return prisma.job.findUnique({
    where: {
      id: jobId,
    },
    select: {
      id: true,
      companyId: true,
      title: true,
    },
  });
};

module.exports = {
  findApplicationById,
  findOfferByApplicationId,
  findOfferById,
  createOffer,
  updateOffer,
  findOffersByStudentId,
  findOffersByJobId,
  findCompanyByOwner,
  findJobById,
};
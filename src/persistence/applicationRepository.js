const prisma = require("../config/prismaClient");

const findJobById = async (jobId) => {
  return prisma.job.findUnique({
    where: {
      id: jobId,
    },
    select: {
      id: true,
      companyId: true,
      title: true,
      status: true,
    },
  });
};

const findApplication = async (jobId, studentId) => {
  return prisma.application.findUnique({
    where: {
      jobId_studentId: {
        jobId,
        studentId,
      },
    },
  });
};

const createApplication = async (jobId, studentId) => {
  return prisma.application.create({
    data: {
      jobId,
      studentId,
      status: "APPLIED",
    },
    include: {
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

const findStudentApplications = async (studentId) => {
  return prisma.application.findMany({
    where: {
      studentId,
    },
    orderBy: {
      appliedAt: "desc",
    },
    include: {
      job: {
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          employmentType: true,
          status: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
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

const findJobApplication = async (applicationId) => {
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

const findCompanyApplications = async (companyId, jobId) => {
  return prisma.application.findMany({
    where: {
      jobId,
      job: {
        companyId,
      },
    },
    orderBy: {
      appliedAt: "asc",
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
        },
      },
    },
  });
};

const shortlistApplication = async (applicationId) => {
  return prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status: "SHORTLISTED",
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

const updateApplicationStatus = async (
  applicationId,
  status
) => {
  return prisma.application.update({
    where: {
      id: applicationId,
    },
    data: {
      status,
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

module.exports = {
  findJobById,
  findApplication,
  createApplication,
  findStudentApplications,
  findCompanyByOwner,
  findJobApplication,
  findCompanyApplications,
  shortlistApplication,
  updateApplicationStatus 
};
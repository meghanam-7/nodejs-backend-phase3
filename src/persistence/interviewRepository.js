const prisma = require("../config/prismaClient");

/*
 * Find an application with the student, job, and company
 * details required for interview scheduling and authorization.
 */
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
          company: {
            select: {
              id: true,
              name: true,
              ownerUserId: true,
            },
          },
        },
      },
    },
  });
};

/*
 * Find an existing interview for an application.
 *
 * One application can have at most one interview
 * in the current Task 13 scheduling workflow.
 */
const findInterviewByApplicationId = async (
  applicationId
) => {
  return prisma.interview.findUnique({
    where: {
      applicationId,
    },
  });
};

/*
 * Create a new interview record.
 */
const createInterview = async (data) => {
  return prisma.interview.create({
    data: {
      applicationId: data.applicationId,
      jobId: data.jobId,
      studentId: data.studentId,
      scheduledAt: data.scheduledAt,
      duration: data.duration,
      status: data.status,
      meetingUrl: data.meetingUrl,
      notes: data.notes,
    },
  });
};

/*
 * Find an interview by its ID.
 */
const findInterviewById = async (interviewId) => {
  return prisma.interview.findUnique({
    where: {
      id: interviewId,
    },
    include: {
      application: {
        select: {
          id: true,
          status: true,
        },
      },
      job: {
        select: {
          id: true,
          title: true,
          companyId: true,
        },
      },
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });
};

/*
 * Find all interviews belonging to a student.
 */
const findInterviewsByStudentId = async (studentId) => {
  return prisma.interview.findMany({
    where: {
      studentId,
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
    orderBy: {
      scheduledAt: "asc",
    },
  });
};

/*
 * Find all interviews scheduled for a job.
 */
const findInterviewsByJobId = async (jobId) => {
  return prisma.interview.findMany({
    where: {
      jobId,
    },
    include: {
      student: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      application: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });
};

/*
 * Find interviews for a student within a specific time range.
 *
 * Used by the service layer to prevent overlapping
 * interview schedules.
 */
const findStudentInterviewsInRange = async (
  studentId,
  startTime,
  endTime
) => {
  return prisma.interview.findMany({
    where: {
      studentId,
      status: {
        not: "CANCELLED",
      },
      scheduledAt: {
        lt: endTime,
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });
};

/*
 * Find interviews for a job within a specific time range.
 *
 * Used by the service layer to prevent conflicting
 * interview schedules for the same job.
 */
const findJobInterviewsInRange = async (
  jobId,
  startTime,
  endTime
) => {
  return prisma.interview.findMany({
    where: {
      jobId,
      status: {
        not: "CANCELLED",
      },
      scheduledAt: {
        lt: endTime,
      },
    },
    orderBy: {
      scheduledAt: "asc",
    },
  });
};

/*
 * Update an existing interview.
 */
const updateInterview = async (
  interviewId,
  data
) => {
  return prisma.interview.update({
    where: {
      id: interviewId,
    },
    data,
  });
};

/*
 * Delete an interview.
 */
const deleteInterview = async (interviewId) => {
  return prisma.interview.delete({
    where: {
      id: interviewId,
    },
  });
};

/*
 * Find the company owned by an authenticated user.
 */
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
  findInterviewByApplicationId,
  createInterview,
  findInterviewById,
  findInterviewsByStudentId,
  findInterviewsByJobId,
  findStudentInterviewsInRange,
  findJobInterviewsInRange,
  updateInterview,
  deleteInterview,
  findCompanyByOwner,
  findJobById
};
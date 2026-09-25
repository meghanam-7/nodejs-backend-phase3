const interviewRepository = require("../persistence/interviewRepository");
const applicationStatusService = require("./applicationStatusService");

const scheduleInterview = async ({
  companyUserId,
  applicationId,
  scheduledAt,
  durationMinutes = 60,
  meetingUrl = null,
}) => {
  // 1. Validate required input
  if (!applicationId) {
    throw new Error("Application ID is required");
  }

  if (!scheduledAt) {
    throw new Error("Scheduled date and time are required");
  }

  // 2. Validate scheduled date
  const interviewDate = new Date(scheduledAt);

  if (Number.isNaN(interviewDate.getTime())) {
    throw new Error("Scheduled date and time must be valid");
  }

  // 3. Prevent scheduling an interview in the past
  if (interviewDate <= new Date()) {
    throw new Error("Interview cannot be scheduled in the past");
  }

  // 4. Validate duration
  const duration = Number(durationMinutes);

  if (!Number.isInteger(duration) || duration <= 0) {
    throw new Error(
      "Interview duration must be a positive integer"
    );
  }

  // 5. Find the application
  const application =
    await interviewRepository.findApplicationById(
      applicationId
    );

  if (!application) {
    throw new Error("Application not found");
  }

  // 6. Verify that the authenticated company owns the job
  const company =
    await interviewRepository.findCompanyByOwner(
      companyUserId
    );

  if (!company) {
    throw new Error(
      "Company profile not found for this user"
    );
  }

  if (application.job.companyId !== company.id) {
    throw new Error(
      "You are not authorized to schedule an interview for this application"
    );
  }

  // 7. Only shortlisted candidates can be interviewed
  if (application.status !== "SHORTLISTED") {
    throw new Error(
      "An interview can only be scheduled for a shortlisted candidate"
    );
  }

  // 8. Prevent duplicate interview scheduling
  const existingInterview =
    await interviewRepository.findInterviewByApplicationId(
      applicationId
    );

  if (existingInterview) {
    throw new Error(
      "An interview has already been scheduled for this application"
    );
  }

  // 9. Validate optional meeting URL
  if (meetingUrl !== null && meetingUrl !== undefined) {
    if (
      typeof meetingUrl !== "string" ||
      meetingUrl.trim().length === 0
    ) {
      throw new Error(
        "Meeting URL must be a valid non-empty string"
      );
    }
  }

  // 10. Create the interview
  const interview =
    await interviewRepository.createInterview({
      applicationId,
      studentId: application.student.id,
      jobId: application.job.id,
      scheduledAt: interviewDate,
      duration,
      meetingUrl: meetingUrl
        ? meetingUrl.trim()
        : null,
      status: "SCHEDULED",
    });

  // 11. Update application status through the Status Model
  await applicationStatusService.updateApplicationStatus(
    companyUserId,
    applicationId,
    "INTERVIEW_SCHEDULED"
  );

  // 12. Return the created interview
  return interview;
};

const getInterviewById = async (
  userId,
  interviewId
) => {
  const interview =
    await interviewRepository.findInterviewById(
      interviewId
    );

  if (!interview) {
    throw new Error("Interview not found");
  }

  // Student ownership
  const isStudent =
    interview.studentId === userId;

  // Company ownership
  const company =
    await interviewRepository.findCompanyByOwner(
      userId
    );

  const isCompanyOwner =
    interview.job?.companyId === company?.id;

  if (!isStudent && !isCompanyOwner) {
    throw new Error(
      "You are not authorized to view this interview"
    );
  }

  return interview;
};

const getStudentInterviews = async (
  studentId
) => {
  return interviewRepository.findInterviewsByStudentId(
    studentId
  );
};

const getJobInterviews = async (
  companyUserId,
  jobId
) => {
  // 1. Find company owned by authenticated user
  const company =
    await interviewRepository.findCompanyByOwner(
      companyUserId
    );

  if (!company) {
    throw new Error(
      "Company profile not found for this user"
    );
  }

  // 2. Find the job
  const job =
    await interviewRepository.findJobById(jobId);

  if (!job) {
    throw new Error("Job not found");
  }

  // 3. Verify company ownership
  if (job.companyId !== company.id) {
    throw new Error(
      "You are not authorized to view interviews for this job"
    );
  }

  // 4. Return interviews
  return interviewRepository.findInterviewsByJobId(
    jobId
  );
};

module.exports = {
  scheduleInterview,
  getInterviewById,
  getStudentInterviews,
  getJobInterviews,
};
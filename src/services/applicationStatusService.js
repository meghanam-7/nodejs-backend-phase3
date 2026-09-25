const applicationRepository = require("../persistence/applicationRepository");
const statusHistoryRepository = require("../persistence/applicationStatusHistoryRepository");

const ALLOWED_STATUSES = [
  "APPLIED",
  "SHORTLISTED",
  "INTERVIEW_SCHEDULED",
  "OFFERED",
  "ACCEPTED",
  "REJECTED",
  "WITHDRAWN",
];

const ALLOWED_TRANSITIONS = {
  APPLIED: [
    "SHORTLISTED",
    "REJECTED",
    "WITHDRAWN",
  ],

  SHORTLISTED: [
    "INTERVIEW_SCHEDULED",
    "OFFERED",
    "REJECTED",
    "WITHDRAWN",
  ],

  INTERVIEW_SCHEDULED: [
    "OFFERED",
    "REJECTED",
    "WITHDRAWN",
  ],

  OFFERED: [
    "ACCEPTED",
    "REJECTED",
    "WITHDRAWN",
  ],

  ACCEPTED: [],

  REJECTED: [],

  WITHDRAWN: [],
};

const validateStatus = (status) => {
  if (!ALLOWED_STATUSES.includes(status)) {
    throw new Error(`Invalid application status: ${status}`);
  }
};

const validateTransition = (currentStatus, newStatus) => {
  validateStatus(currentStatus);
  validateStatus(newStatus);

  if (currentStatus === newStatus) {
    throw new Error(
      `Application is already in ${currentStatus} status`
    );
  }

  const allowedNextStatuses =
    ALLOWED_TRANSITIONS[currentStatus] || [];

  if (!allowedNextStatuses.includes(newStatus)) {
    throw new Error(
      `Invalid status transition: ${currentStatus} -> ${newStatus}`
    );
  }
};

const updateApplicationStatus = async (
  companyUserId,
  applicationId,
  newStatus
) => {
  // 1. Validate the requested status
  validateStatus(newStatus);

  // 2. Find the application
  const application =
    await applicationRepository.findJobApplication(
      applicationId
    );

  if (!application) {
    throw new Error("Application not found");
  }

  // 3. Find the company owned by the authenticated user
  const company =
    await applicationRepository.findCompanyByOwner(
      companyUserId
    );

  if (!company) {
    throw new Error(
      "Company profile not found for this user"
    );
  }

  // 4. Verify that this company owns the application's job
  if (application.job.companyId !== company.id) {
    throw new Error(
      "You are not authorized to update this application"
    );
  }

  // 5. Get the current application status
  const currentStatus = application.status;

  // 6. Validate the state transition
  validateTransition(
    currentStatus,
    newStatus
  );

  // 7. Update the application's current status
  const updatedApplication =
    await applicationRepository.updateApplicationStatus(
      applicationId,
      newStatus
    );

  // 8. Record the status transition in history
  await statusHistoryRepository.createStatusHistory(
    applicationId,
    newStatus
  );

  // 9. Return the updated application
  return updatedApplication;
};

const getApplicationStatusHistory = async (
  applicationId
) => {
  const application =
    await applicationRepository.findJobApplication(
      applicationId
    );

  if (!application) {
    throw new Error("Application not found");
  }

  return statusHistoryRepository.findHistoryByApplicationId(
    applicationId
  );
};

const getLatestApplicationStatusHistory = async (
  applicationId
) => {
  const application =
    await applicationRepository.findJobApplication(
      applicationId
    );

  if (!application) {
    throw new Error("Application not found");
  }

  return statusHistoryRepository.findLatestStatusHistory(
    applicationId
  );
};

module.exports = {
  ALLOWED_STATUSES,
  ALLOWED_TRANSITIONS,
  validateStatus,
  validateTransition,
  updateApplicationStatus,
  getApplicationStatusHistory,
  getLatestApplicationStatusHistory,
};
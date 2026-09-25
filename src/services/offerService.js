const crypto = require("crypto");

const offerRepository = require("../persistence/offerRepository");
const esignService = require("./esignService");
const applicationStatusService = require("./applicationStatusService");

const generateOffer = async (
  companyUserId,
  applicationId,
  compensation,
  currency = "INR",
  joiningDate = null
) => {
  // 1. Find the application with student and job details
  const application =
    await offerRepository.findApplicationById(
      applicationId
    );

  if (!application) {
    throw new Error("Application not found");
  }

  // 2. Verify that the authenticated company owns the job
  const company =
    await offerRepository.findCompanyByOwner(
      companyUserId
    );

  if (!company) {
    throw new Error(
      "Company profile not found for this user"
    );
  }

  if (application.job.companyId !== company.id) {
    throw new Error(
      "You are not authorized to generate an offer for this application"
    );
  }

  // 3. Only candidates with an interview scheduled
  // can receive an offer
  if (application.status !== "INTERVIEW_SCHEDULED") {
    throw new Error(
      "An offer can only be generated for a candidate with a scheduled interview"
    );
  }

  // 4. Prevent duplicate offer generation
  const existingOffer =
    await offerRepository.findOfferByApplicationId(
      applicationId
    );

  if (existingOffer) {
    throw new Error(
      "An offer has already been generated for this application"
    );
  }

  // 5. Validate compensation
  if (
    compensation === undefined ||
    compensation === null ||
    Number(compensation) <= 0
  ) {
    throw new Error(
      "Compensation must be greater than zero"
    );
  }

  // 6. Create the offer
  const offer =
    await offerRepository.createOffer({
      applicationId,
      studentId: application.student.id,
      jobId: application.job.id,
      compensation: Number(compensation),
      currency,
      joiningDate: joiningDate
        ? new Date(joiningDate)
        : null,
      status: "DRAFT",
      documentUrl: null,
      eSignProvider: null,
      eSignStatus: "NOT_STARTED",
      eSignRequestId: null,
      signedHash: null,
    });

  // 7. Update application status through
  // the central Status Model
  await applicationStatusService.updateApplicationStatus(
    companyUserId,
    applicationId,
    "OFFERED"
  );

  // 8. Return the created offer
  return offer;
};

const getOfferById = async (userId, offerId) => {
  const offer =
    await offerRepository.findOfferById(offerId);

  if (!offer) {
    throw new Error("Offer not found");
  }

  const isStudent =
    offer.studentId === userId;

  const isCompanyOwner =
    offer.application?.job?.companyId ===
    (
      await offerRepository.findCompanyByOwner(
        userId
      )
    )?.id;

  if (!isStudent && !isCompanyOwner) {
    throw new Error(
      "You are not authorized to view this offer"
    );
  }

  return offer;
};

const getStudentOffers = async (studentId) => {
  return offerRepository.findOffersByStudentId(
    studentId
  );
};

const getJobOffers = async (
  companyUserId,
  jobId
) => {
  const company =
    await offerRepository.findCompanyByOwner(
      companyUserId
    );

  if (!company) {
    throw new Error(
      "Company profile not found for this user"
    );
  }

  const job =
    await offerRepository.findJobById(jobId);

  if (!job) {
    throw new Error("Job not found");
  }

  if (job.companyId !== company.id) {
    throw new Error(
      "You are not authorized to view offers for this job"
    );
  }

  return offerRepository.findOffersByJobId(jobId);
};

/*
 * Request e-Signature for an offer
 */
const requestOfferESign = async (
  companyUserId,
  offerId,
  documentUrl
) => {
  // 1. Find the offer
  const offer =
    await offerRepository.findOfferById(offerId);

  if (!offer) {
    throw new Error("Offer not found");
  }

  // 2. Verify that the authenticated company owns
  // the offer's job
  const company =
    await offerRepository.findCompanyByOwner(
      companyUserId
    );

  if (!company) {
    throw new Error(
      "Company profile not found for this user"
    );
  }

  if (
    offer.application?.job?.companyId !==
    company.id
  ) {
    throw new Error(
      "You are not authorized to request e-Sign for this offer"
    );
  }

  // 3. Only draft offers can enter the e-Sign workflow
  if (offer.status !== "DRAFT") {
    throw new Error(
      "Only draft offers can be sent for e-Sign"
    );
  }

  // 4. Prevent duplicate e-Sign requests
  if (
    offer.eSignStatus &&
    offer.eSignStatus !== "NOT_STARTED"
  ) {
    throw new Error(
      "An e-Sign request has already been created for this offer"
    );
  }

  // 5. Create the e-Sign request through
  // the provider service
  const eSignRequest =
    await esignService.createESignRequest({
      offerId,
      documentUrl,
    });

  // 6. Persist the e-Sign request details
  return offerRepository.updateOffer(
    offerId,
    {
      documentUrl: eSignRequest.documentUrl,
      eSignProvider:
        eSignRequest.eSignProvider,
      eSignRequestId:
        eSignRequest.eSignRequestId,
      eSignStatus:
        eSignRequest.eSignStatus,
    }
  );
};

/*
 * Complete the e-Sign workflow and create
 * a tamper-evident SHA-256 hash.
 */
const signOffer = async (
  studentId,
  offerId
) => {
  // 1. Find the offer
  const offer =
    await offerRepository.findOfferById(offerId);

  if (!offer) {
    throw new Error("Offer not found");
  }

  // 2. Verify that the authenticated student
  // owns the offer
  if (offer.studentId !== studentId) {
    throw new Error(
      "You are not authorized to sign this offer"
    );
  }

  // 3. The offer must have an active e-Sign request
  if (offer.eSignStatus !== "REQUESTED") {
    throw new Error(
      "Offer is not ready for signing"
    );
  }

  // 4. Prevent signing the same offer twice
  if (offer.status === "SIGNED") {
    throw new Error(
      "Offer has already been signed"
    );
  }

  /*
   * Build a deterministic representation of the
   * offer's important business data.
   */
  const hashPayload = JSON.stringify({
    id: offer.id,
    applicationId: offer.applicationId,
    studentId: offer.studentId,
    jobId: offer.jobId,
    compensation: offer.compensation,
    currency: offer.currency,
    joiningDate: offer.joiningDate
      ? offer.joiningDate.toISOString()
      : null,
    documentUrl: offer.documentUrl,
  });

  // 5. Generate SHA-256 tamper-evident hash
  const signedHash = crypto
    .createHash("sha256")
    .update(hashPayload)
    .digest("hex");

  // 6. Persist signed state and hash
  return offerRepository.updateOffer(
    offerId,
    {
      status: "SIGNED",
      eSignStatus: "SIGNED",
      signedAt: new Date(),
      signedHash,
    }
  );
};

/*
 * Verify the tamper-evident hash of a signed offer.
 */
const verifyOfferHash = async (
  userId,
  offerId
) => {
  // 1. Find the offer
  const offer =
    await offerRepository.findOfferById(offerId);

  if (!offer) {
    throw new Error("Offer not found");
  }

  // 2. Verify ownership
  const company =
    await offerRepository.findCompanyByOwner(
      userId
    );

  const isStudent =
    offer.studentId === userId;

  const isCompanyOwner =
    offer.application?.job?.companyId ===
    company?.id;

  if (!isStudent && !isCompanyOwner) {
    throw new Error(
      "You are not authorized to verify this offer"
    );
  }

  // 3. A hash must exist before verification
  if (!offer.signedHash) {
    throw new Error(
      "Offer has not been signed or hashed"
    );
  }

  // 4. Recreate the exact hash payload
  const hashPayload = JSON.stringify({
    id: offer.id,
    applicationId: offer.applicationId,
    studentId: offer.studentId,
    jobId: offer.jobId,
    compensation: offer.compensation,
    currency: offer.currency,
    joiningDate: offer.joiningDate
      ? offer.joiningDate.toISOString()
      : null,
    documentUrl: offer.documentUrl,
  });

  const calculatedHash = crypto
    .createHash("sha256")
    .update(hashPayload)
    .digest("hex");

  // 5. Compare stored and calculated hashes
  const isValid =
    calculatedHash === offer.signedHash;

  return {
    offerId: offer.id,
    storedHash: offer.signedHash,
    calculatedHash,
    valid: isValid,
  };
};

module.exports = {
  generateOffer,
  getOfferById,
  getStudentOffers,
  getJobOffers,
  requestOfferESign,
  signOffer,
  verifyOfferHash,
};
const offerService = require("../services/offerService");

const generateOffer = async (req, res) => {
  try {
    const companyUserId = req.user.id;
    const applicationId = Number(req.body.applicationId);

    const {
      compensation,
      currency,
      joiningDate,
    } = req.body;

    const offer = await offerService.generateOffer(
      companyUserId,
      applicationId,
      compensation,
      currency,
      joiningDate
    );

    return res.status(201).json({
      success: true,
      message: "Offer generated successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Generate offer error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getOfferById = async (req, res) => {
  try {
    const userId = req.user.id;
    const offerId = Number(req.params.id);

    const offer = await offerService.getOfferById(
      userId,
      offerId
    );

    return res.status(200).json({
      success: true,
      message: "Offer retrieved successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Get offer error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getStudentOffers = async (req, res) => {
  try {
    const offers =
      await offerService.getStudentOffers(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      message: "Student offers retrieved successfully",
      data: offers,
    });
  } catch (error) {
    console.error("Get student offers error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getJobOffers = async (req, res) => {
  try {
    const companyUserId = req.user.id;
    const jobId = Number(req.params.jobId);

    const offers =
      await offerService.getJobOffers(
        companyUserId,
        jobId
      );

    return res.status(200).json({
      success: true,
      message: "Job offers retrieved successfully",
      data: offers,
    });
  } catch (error) {
    console.error("Get job offers error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*
 * Request e-Signature for an offer
 */
const requestOfferESign = async (req, res) => {
  try {
    const companyUserId = req.user.id;
    const offerId = Number(req.params.id);
    const { documentUrl } = req.body;

    const offer = await offerService.requestOfferESign(
      companyUserId,
      offerId,
      documentUrl
    );

    return res.status(200).json({
      success: true,
      message: "Offer sent for e-Sign successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Request e-Sign error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*
 * Complete the e-Signature process for an offer
 */
const signOffer = async (req, res) => {
  try {
    const studentId = req.user.id;
    const offerId = Number(req.params.id);

    const offer = await offerService.signOffer(
      studentId,
      offerId
    );

    return res.status(200).json({
      success: true,
      message: "Offer signed successfully",
      data: offer,
    });
  } catch (error) {
    console.error("Sign offer error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*
 * Verify the tamper-evident hash of a signed offer
 */
const verifyOfferHash = async (req, res) => {
  try {
    const userId = req.user.id;
    const offerId = Number(req.params.id);

    const result =
      await offerService.verifyOfferHash(
        userId,
        offerId
      );

    return res.status(200).json({
      success: true,
      message: "Offer hash verification completed",
      data: result,
    });
  } catch (error) {
    console.error(
      "Verify offer hash error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
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
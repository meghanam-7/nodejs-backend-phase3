const applicationService = require("../services/applicationService");

const applyToJob = async (req, res) => {
  try {
    const application = await applicationService.applyToJob(
      req.user.id,
      Number(req.params.id)
    );

    return res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
    });
  } catch (error) {
    console.error("Apply to job error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getMyApplications = async (req, res) => {
  try {
    const applications =
      await applicationService.getMyApplications(
        req.user.id
      );

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Get my applications error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getJobApplications = async (req, res) => {
  try {
    const applications =
      await applicationService.getJobApplications(
        req.user.id,
        Number(req.params.id)
      );

    return res.status(200).json({
      success: true,
      data: applications,
    });
  } catch (error) {
    console.error("Get job applications error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const shortlistApplication = async (req, res) => {
  try {
    const application =
      await applicationService.shortlistApplication(
        req.user.id,
        Number(req.params.id)
      );

    return res.status(200).json({
      success: true,
      message: "Candidate shortlisted successfully",
      data: application,
    });
  } catch (error) {
    console.error("Shortlist application error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  applyToJob,
  getMyApplications,
  getJobApplications,
  shortlistApplication,
};
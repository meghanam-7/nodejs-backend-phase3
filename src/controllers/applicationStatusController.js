const applicationStatusService = require("../services/applicationStatusService");

const updateApplicationStatus = async (req, res) => {
  try {
    const applicationId = Number(req.params.id);
    const { status } = req.body;

    const application =
      await applicationStatusService.updateApplicationStatus(
        req.user.id,
        applicationId,
        status
      );

    return res.status(200).json({
      success: true,
      message: "Application status updated successfully",
      data: application,
    });
  } catch (error) {
    console.error("Update application status error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getApplicationStatusHistory = async (req, res) => {
  try {
    const applicationId = Number(req.params.id);

    const history =
      await applicationStatusService.getApplicationStatusHistory(
        req.user.id,
        applicationId
      );

    return res.status(200).json({
      success: true,
      message: "Application status history retrieved successfully",
      data: history,
    });
  } catch (error) {
    console.error("Get application status history error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getLatestApplicationStatusHistory = async (req, res) => {
  try {
    const applicationId = Number(req.params.id);

    const history =
      await applicationStatusService.getLatestApplicationStatusHistory(
        req.user.id,
        applicationId
      );

    return res.status(200).json({
      success: true,
      message: "Latest application status retrieved successfully",
      data: history,
    });
  } catch (error) {
    console.error(
      "Get latest application status history error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  updateApplicationStatus,
  getApplicationStatusHistory,
  getLatestApplicationStatusHistory,
};
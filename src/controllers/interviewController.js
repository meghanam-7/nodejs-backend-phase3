const interviewService = require("../services/interviewService");

/*
 * Schedule an interview for a shortlisted application
 */
const scheduleInterview = async (req, res) => {
  try {
    const companyUserId = req.user.id;

    const {
      applicationId,
      scheduledAt,
      durationMinutes,
      meetingUrl,
    } = req.body;

    const interview =
      await interviewService.scheduleInterview({
        companyUserId,
        applicationId,
        scheduledAt,
        durationMinutes,
        meetingUrl,
      });

    return res.status(201).json({
      success: true,
      message: "Interview scheduled successfully",
      data: interview,
    });
  } catch (error) {
    console.error(
      "Schedule interview error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*
 * Get a specific interview
 */
const getInterviewById = async (req, res) => {
  try {
    const userId = req.user.id;
    const interviewId = Number(req.params.id);

    const interview =
      await interviewService.getInterviewById(
        userId,
        interviewId
      );

    return res.status(200).json({
      success: true,
      message: "Interview retrieved successfully",
      data: interview,
    });
  } catch (error) {
    console.error(
      "Get interview error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*
 * Get interviews for the authenticated student
 */
const getStudentInterviews = async (req, res) => {
  try {
    const studentId = req.user.id;

    const interviews =
      await interviewService.getStudentInterviews(
        studentId
      );

    return res.status(200).json({
      success: true,
      message:
        "Student interviews retrieved successfully",
      data: interviews,
    });
  } catch (error) {
    console.error(
      "Get student interviews error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

/*
 * Get interviews for a company-owned job
 */
const getJobInterviews = async (req, res) => {
  try {
    const companyUserId = req.user.id;
    const jobId = Number(req.params.jobId);

    const interviews =
      await interviewService.getJobInterviews(
        companyUserId,
        jobId
      );

    return res.status(200).json({
      success: true,
      message:
        "Job interviews retrieved successfully",
      data: interviews,
    });
  } catch (error) {
    console.error(
      "Get job interviews error:",
      error
    );

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  scheduleInterview,
  getInterviewById,
  getStudentInterviews,
  getJobInterviews,
};
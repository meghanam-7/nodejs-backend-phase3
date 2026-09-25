const jobService = require("../services/jobService");

const createJob = async (req, res) => {
  try {
    const job = await jobService.createJob(
      req.user.id,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Job published successfully",
      data: job,
    });
  } catch (error) {
    console.error("Create job error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getJobs = async (req, res) => {
  try {
    const jobs = await jobService.getCompanyJobs(
      req.user.id
    );

    return res.status(200).json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error("Get jobs error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const getJob = async (req, res) => {
  try {
    const job = await jobService.getCompanyJob(
      req.user.id,
      Number(req.params.id)
    );

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

const evaluateJob = async (req, res) => {
  try {
    const result = await jobService.evaluateJob(
      req.user.id,
      Number(req.params.id),
      req.body.skills
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createJob,
  getJobs,
  getJob,
  evaluateJob,
};
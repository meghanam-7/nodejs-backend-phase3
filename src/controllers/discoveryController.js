const discoveryService = require("../services/discoveryService");

const searchJobs = async (req, res) => {
  try {
    const {
      search,
      location,
      employmentType,
    } = req.query;

    const jobs = await discoveryService.searchJobs({
      search,
      location,
      employmentType,
    });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      data: jobs,
    });
  } catch (error) {
    console.error("Search jobs error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to search jobs.",
    });
  }
};

module.exports = {
  searchJobs,
};
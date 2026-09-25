const crypto = require("crypto");
const prisma = require("../config/prismaClient");

const generateAssessmentToken = () => {
  return crypto.randomBytes(32).toString("hex");
};

const purgeExpiredAssessments = async () => {
  const result = await prisma.jobAssessment.deleteMany({
    where: {
      expiresAt: {
        not: null,
        lt: new Date(),
      },
    },
  });

  return result.count;
};

module.exports = {
  generateAssessmentToken,
  purgeExpiredAssessments,
};

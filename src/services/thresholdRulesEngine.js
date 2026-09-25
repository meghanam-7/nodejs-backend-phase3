const MIN_LEVEL = 1;
const MAX_LEVEL = 100;

const validateThresholdLevel = (level) => {
  return (
    Number.isInteger(level) &&
    level >= MIN_LEVEL &&
    level <= MAX_LEVEL
  );
};

const evaluateThresholds = (thresholds, candidateSkills = []) => {
  const results = thresholds.map((threshold) => {
    const candidateSkill = candidateSkills.find(
      (skill) => skill.competencyId === threshold.competencyId
    );

    const candidateLevel = candidateSkill
      ? candidateSkill.level
      : null;

    const passed =
      candidateLevel !== null &&
      candidateLevel >= threshold.minimumLevel;

    return {
      competencyId: threshold.competencyId,
      competency: threshold.competency?.name || null,
      requiredLevel: threshold.minimumLevel,
      candidateLevel,
      passed,
    };
  });

  return {
    eligible:
      results.length > 0 &&
      results.every((result) => result.passed),

    results,
  };
};

module.exports = {
  MIN_LEVEL,
  MAX_LEVEL,
  validateThresholdLevel,
  evaluateThresholds,
};
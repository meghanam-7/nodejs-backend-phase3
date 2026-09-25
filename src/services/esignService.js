const crypto = require("crypto");

const createESignRequest = async ({
  offerId,
  documentUrl,
}) => {
  if (!offerId) {
    throw new Error("Offer ID is required");
  }

  if (!documentUrl) {
    throw new Error("Document URL is required");
  }

  const eSignRequestId = `ESIGN-${crypto.randomUUID()}`;

  return {
    eSignProvider: "MOCK_ESIGN",
    eSignRequestId,
    eSignStatus: "REQUESTED",
    documentUrl,
  };
};

module.exports = {
  createESignRequest,
};
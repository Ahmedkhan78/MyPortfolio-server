// controllers/certificateController.js
require("dotenv").config();

const redirectCertificate = (req, res) => {
  const certificateLink = process.env.CERTIFICATE_LINK;

  if (!certificateLink) {
    return res
      .status(500)
      .json({ success: false, message: "Certificate link not configured" });
  }

  // ✅ JSON response
  return res.json({ link: certificateLink });
};

module.exports = { redirectCertificate };

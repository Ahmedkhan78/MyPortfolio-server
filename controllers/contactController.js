const { contactCollection } = require("../firebase/firebase");
// const transporter = require('../utils/emailTransporter'); // optional

const handleContactForm = async (req, res) => {
  const { name, email, message } = req.body;

  try {
    await contactCollection.add({
      name,
      email,
      message,
      timestamp: new Date(),
    });

    // await transporter.sendMail({ ... }) // optional

    res
      .status(200)
      .json({ success: true, message: "Contact saved and email sent" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

module.exports = {
  handleContactForm,
};

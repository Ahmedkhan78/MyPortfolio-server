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

const getContact = async (req, res) => {
  try {
    const snapshot = await contactCollection.orderBy("timestamp", "desc").get();
    const contacts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(contacts);
  } catch (err) {
    console.error("Error fetching contacts:", err);
    res.status(500).json({ error: "Failed to fetch contacts" });
  }
};

const getContactById = async (req, res) => {
  const { id } = req.params;
  try {
    const doc = await contactCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: "Contact not found" });
    }
    res.json({ id: doc.id, ...doc.data() });
  } catch (err) {
    console.error("Error fetching contact by id:", err);
    res.status(500).json({ error: "Failed to fetch contact" });
  }
};

const deleteContact = async (req, res) => {
  const { id } = req.params;
  try {
    await contactCollection.doc(id).delete();
    res.json({ success: true, message: "Contact deleted successfully" });
  } catch (err) {
    console.error("Error deleting contact:", err);
    res.status(500).json({ error: "Failed to delete contact" });
  }
};

module.exports = {
  handleContactForm,
  getContact,
  getContactById,
  deleteContact,
};

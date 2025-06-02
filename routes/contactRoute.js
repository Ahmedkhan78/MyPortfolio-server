const express = require("express");
const router = express.Router();
const {
  handleContactForm,
  getContact,
  getContactById,
} = require("../controllers/contactController");

router.get("/", getContact);
router.post("/", handleContactForm);
router.get("/:id", getContactById);

module.exports = router;

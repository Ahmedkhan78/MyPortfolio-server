const express = require("express");
const router = express.Router();
const {
  handleContactForm,
  getContact,
  getContactById,
  deleteContact,
} = require("../controllers/contactController");

router.get("/", getContact);
router.post("/", handleContactForm);
router.get("/:id", getContactById);
router.delete("/:id", deleteContact);

module.exports = router;

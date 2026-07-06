const express = require("express");
const router = express.Router();

const resumeController = require("../controllers/resumeController");

router.get("/resumes", resumeController.getResumeList);
router.get("/resume/:file", resumeController.getResume);

module.exports = router;

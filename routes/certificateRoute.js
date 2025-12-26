// routes/certificateRoute.js

const express = require("express");
const router = express.Router();
const { redirectCertificate } = require("../controllers/certificateController");

router.get("/", redirectCertificate);

module.exports = router;

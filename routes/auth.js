require("dotenv").config();

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { verify } = require("otplib");

const router = express.Router();

const { adminPassword, adminUsername } = require("../utils/config");

// ======================================================
// ADMIN USER
// ======================================================

const users = [
  {
    username: adminUsername,
    password: bcrypt.hashSync(adminPassword, 10),
    role: "admin",
  },
];

// ======================================================
// AUTH CONFIG CHECK
// ======================================================

const getAuthConfigError = () => {
  if (!process.env.JWT_SECRET) {
    return "JWT_SECRET is not configured";
  }

  if (!process.env.ADMIN_TOTP_SECRET) {
    return "ADMIN_TOTP_SECRET is not configured";
  }

  return null;
};

// ======================================================
// MFA UNLOCK
// ======================================================
//
// Secret keyboard code ke baad frontend yahan
// Authenticator ka 6-digit code bhejega.
//
// Ye actual login JWT nahi banata.
// Sirf 5 minute ka temporary unlock token banata hai.
// ======================================================

router.post("/confirm-mfa", async (req, res) => {
  try {
    const configError = getAuthConfigError();

    if (configError) {
      console.error(configError);

      return res.status(500).json({
        success: false,
        error: "Authentication service is not configured",
      });
    }

    const { code } = req.body || {};

    // ----------------------------------------------
    // CODE VALIDATION
    // ----------------------------------------------

    if (!/^\d{6}$/.test(code || "")) {
      return res.status(400).json({
        success: false,
        error: "MFA code must be 6 digits",
      });
    }

    // ----------------------------------------------
    // VERIFY AUTHENTICATOR
    // ----------------------------------------------

    const result = await verify({
      secret: process.env.ADMIN_TOTP_SECRET,
      token: code,
    });

    if (!result.valid) {
      return res.status(401).json({
        success: false,
        error: "Invalid authenticator code",
      });
    }

    // ----------------------------------------------
    // CREATE TEMPORARY UNLOCK TOKEN
    // ----------------------------------------------

    const accessToken = jwt.sign(
      {
        purpose: "login-unlock",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "5m",
      },
    );

    return res.status(200).json({
      success: true,
      accessToken,
    });
  } catch (error) {
    console.error("MFA unlock error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to verify authenticator",
    });
  }
});

// ======================================================
// LOGIN
// ======================================================
//
// Flow:
//
// Secret code
//      ↓
// Authenticator
//      ↓
// /unlock
//      ↓
// Temporary unlock token
//      ↓
// /login
//      ↓
// Username + password
//      ↓
// REAL JWT
// ======================================================

router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // ==================================================
    // INPUT VALIDATION
    // ==================================================

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username and password are required",
      });
    }

    // ==================================================
    // FIND USER
    // ==================================================

    const user = users.find((u) => u.username === username);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // ==================================================
    // PASSWORD
    // ==================================================

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        error: "Invalid credentials",
      });
    }

    // ==================================================
    // JWT
    // ==================================================

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not configured");

      return res.status(500).json({
        success: false,
        error: "Authentication service is not configured",
      });
    }

    const token = jwt.sign(
      {
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
      },
    );

    // ==================================================
    // SUCCESS
    // ==================================================

    return res.json({
      success: true,
      token,
      user: {
        username: user.username,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      error: "Login failed",
    });
  }
});

module.exports = router;

require("dotenv").config();

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const QRCode = require("qrcode");
const { generateURI, verify } = require("otplib");

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
// MFA SETUP
// ======================================================
//
// IMPORTANT:
// Setup endpoint ko production mein public mat chhodna.
// Isko sirf initial setup ke time use karo.
//

router.get("/setup-mfa", async (req, res) => {
  try {
    const secret = process.env.ADMIN_TOTP_SECRET;

    if (!secret) {
      return res.status(500).send("MFA is not configured.");
    }

    const otpauth = generateURI({
      issuer: "Ahmed.Dev",
      label: adminUsername,
      secret,
    });

    const qrCode = await QRCode.toDataURL(otpauth);

    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Ahmed.Dev MFA Setup</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">

          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #111827;
              color: white;
              font-family: Arial, sans-serif;
            }

            .container {
              width: calc(100% - 40px);
              max-width: 420px;
              padding: 35px;
              text-align: center;
              background: #1f2937;
              border-radius: 16px;
              box-shadow: 0 20px 50px rgba(0,0,0,.35);
            }

            img {
              width: 280px;
              max-width: 100%;
              padding: 12px;
              margin: 20px 0;
              background: white;
              border-radius: 12px;
            }

            input {
              width: 100%;
              padding: 14px;
              font-size: 22px;
              text-align: center;
              letter-spacing: 6px;
              border: none;
              outline: none;
              border-radius: 8px;
            }

            button {
              width: 100%;
              padding: 14px;
              margin-top: 15px;
              border: none;
              border-radius: 8px;
              background: #3182ce;
              color: white;
              font-size: 16px;
              cursor: pointer;
            }

            #message {
              margin-top: 15px;
              font-weight: bold;
            }

            .success {
              color: #68d391;
            }

            .error {
              color: #fc8181;
            }
          </style>
        </head>

        <body>

          <div class="container">

            <h1>Ahmed.Dev MFA</h1>

            <p>
              Scan this QR code using your Authenticator app.
            </p>

            <img
              src="${qrCode}"
              alt="MFA QR Code"
            />

            <p>
              Account:
              <strong>${adminUsername}</strong>
            </p>

            <input
              id="code"
              type="text"
              inputmode="numeric"
              autocomplete="one-time-code"
              maxlength="6"
              placeholder="123456"
            />

            <button onclick="confirmMFA()">
              Confirm MFA
            </button>

            <div id="message"></div>

          </div>

          <script>

            async function confirmMFA() {

              const input =
                document.getElementById("code");

              const message =
                document.getElementById("message");

              const code =
                input.value
                  .replace(/\\D/g, "")
                  .slice(0, 6);

              if (!/^\\d{6}$/.test(code)) {

                message.className = "error";

                message.textContent =
                  "Enter the 6-digit Authenticator code.";

                return;
              }

              message.className = "";

              message.textContent =
                "Verifying...";

              try {

                const response =
                  await fetch(
                    "/api/auth/confirm-mfa",
                    {
                      method: "POST",

                      headers: {
                        "Content-Type":
                          "application/json"
                      },

                      body: JSON.stringify({
                        code
                      })
                    }
                  );

                const data =
                  await response.json();

                if (!response.ok) {
                  throw new Error(
                    data.error ||
                    "MFA verification failed"
                  );
                }

                message.className =
                  "success";

                message.textContent =
                  "✓ MFA connected successfully!";

                input.value = "";

              } catch (error) {

                message.className =
                  "error";

                message.textContent =
                  error.message;
              }
            }

            document
              .getElementById("code")
              .addEventListener(
                "keydown",
                (event) => {

                  if (event.key === "Enter") {
                    confirmMFA();
                  }

                }
              );

          </script>

        </body>
      </html>
    `);
  } catch (error) {
    console.error("MFA setup error:", error);

    res.status(500).send("Unable to setup MFA.");
  }
});

// ======================================================
// CONFIRM MFA
// ======================================================

router.post("/confirm-mfa", async (req, res) => {
  try {
    const { code } = req.body;

    if (!/^\d{6}$/.test(code || "")) {
      return res.status(400).json({
        success: false,
        error: "MFA code must be 6 digits",
      });
    }

    const secret = process.env.ADMIN_TOTP_SECRET;

    if (!secret) {
      return res.status(500).json({
        success: false,
        error: "MFA is not configured",
      });
    }

    const result = await verify({
      secret,
      token: code,
    });

    if (!result.valid) {
      return res.status(401).json({
        success: false,
        error: "Invalid authenticator code",
      });
    }

    return res.json({
      success: true,
      message: "Authenticator verified successfully",
    });
  } catch (error) {
    console.error("MFA confirmation error:", error);

    return res.status(500).json({
      success: false,
      error: "Unable to verify MFA",
    });
  }
});

// ======================================================
// LOGIN
// ======================================================
//
// username + password + authenticator code
//
// ONLY this endpoint creates the actual JWT.
//

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

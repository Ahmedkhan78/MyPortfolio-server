require("dotenv").config({ path: "/etc/secrets/.env" });
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const { adminPassword, adminUsername } = require("../utils/config");

const users = [
  {
    username: adminUsername,
    password: bcrypt.hashSync(adminPassword, 10),
    role: "admin",
  },
];

//Login route

router.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find((u) => u.username === username);
  if (!user) return res.status(401).json({ error: "Invalid Credentails" });

  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) return res.status(401).json({ error: "Invalid Credentails" });

  const token = jwt.sign(
    { username: user.username, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  res.json({ token });
});

module.exports = router;

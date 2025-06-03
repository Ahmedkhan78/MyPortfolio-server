require("dotenv").config({ path: "/etc/secrets/.env" });

module.exports = {
  adminUsername: process.env.ADMIN_USERNAME,
  adminPassword: process.env.ADMIN_PASSWORD,
  jwtSecretAccess: process.env.JWT_SECRET,

  port: process.env.PORT,
};

const admin = require("firebase-admin");
const fs = require("fs");

// ✅ Use correct Render secret file path
const serviceAccountPath = "/etc/secrets/serviceaccount.json";

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ serviceaccount.json is missing at", serviceAccountPath);
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const projectCollection = db.collection("projects");
const contactCollection = db.collection("contact");

module.exports = { projectCollection, contactCollection };

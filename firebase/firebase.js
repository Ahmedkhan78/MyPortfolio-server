const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccountPath = "/etc/secrets/serviceAccountKey.json";

if (!fs.existsSync(serviceAccountPath)) {
  console.error("❌ serviceaccount.json is missing at", serviceAccountPath);
  process.exit(1);
}

let serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));

// Ensure the private_key field has newlines properly inserted
serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, "\n");

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const projectCollection = db.collection("projects");
const contactCollection = db.collection("contact");

module.exports = { projectCollection, contactCollection };

const admin = require("firebase-admin");
const fs = require("fs");
const path = "/etc/secrets/serviceaccount.json";

if (!fs.existsSync(path)) {
  console.error("❌ serviceaccount.json file is missing at", path);
  process.exit(1); // exit early
}

const serviceAccount = JSON.parse(fs.readFileSync(path, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const projectCollection = db.collection("projects");
const contactCollection = db.collection("contact");

module.exports = { projectCollection, contactCollection };

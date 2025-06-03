const admin = require("firebase-admin");
const fs = require("fs");

// Read the secret file from Render’s mounted path
const serviceAccount = JSON.parse(
  fs.readFileSync("/etc/secrets/serviceaccount.json", "utf8")
);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const projectCollection = db.collection("projects");
const contactCollection = db.collection("contact");

module.exports = { projectCollection, contactCollection };

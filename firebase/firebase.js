const admin = require("firebase-admin");
const fs = require("fs");

const serviceAccountPath = "/etc/secrets/serviceAccountKey.json";

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccountPath),
});

const db = admin.firestore();
const projectCollection = db.collection("projects");
const contactCollection = db.collection("contact");

module.exports = { projectCollection, contactCollection };

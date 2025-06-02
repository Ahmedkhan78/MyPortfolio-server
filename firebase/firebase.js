const admin = require("firebase-admin");
const serviceAccount = require("../serviceaccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const projectCollection = db.collection("projects");
const contactCollection = db.collection("contact");

module.exports = { projectCollection, contactCollection };

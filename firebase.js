const admin = require("firebase-admin");
const serviceAccount = require("./serviceaccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const projectCollection = db.collection("projects");

module.exports = { projectCollection };

const admin = require("firebase-admin");
const { getFirestore, query, where } = require("firebase-admin/firestore");
const serviceAccount = require("../serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://<DATABASE_NAME>.firebaseio.com",
});
const db = getFirestore();
module.exports = { admin, db, query, where };

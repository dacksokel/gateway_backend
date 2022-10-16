const admin = require("firebase-admin");
const { getFirestore } = require("firebase-admin/firestore");
// const { getStorage, ref  } = require("firebase/storage");
const serviceAccount = require("../serviceAccountKey.json");

const BucketUrl = "prueba-dacksokel.appspot.com";
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "",
  storageBucket: BucketUrl,
});
const db = getFirestore();
const bucket = admin.storage().bucket();
module.exports = { admin, db, bucket, BucketUrl };

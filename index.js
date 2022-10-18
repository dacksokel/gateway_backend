const functions = require("firebase-functions");

const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");

const gatewayRouters = require("./routers/gatewayRouters");

/** Settings */
app.set("port", process.env.PORT || 6006);

/**Middleware */
app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE"
  })
);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

/** routers */
app.use("/gateway", gatewayRouters);
app.use("/", (req, res) => {
  res.send("hola :D");
});

exports.app = functions.https.onRequest(app)
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//   functions.logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

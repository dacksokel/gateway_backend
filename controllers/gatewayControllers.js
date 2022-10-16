const { admin, db, bucket, BucketUrl } = require("../firebase");
const { genMacs, genSingleIp } = require("../helpers/genMacAndIpv4");

const multer = require("multer");
// const storage = multer.diskStorage({
// //   destination: function (req, file, cb) {
// //     cb(null, "uploads");
// //   },
// //   filename: function (req, file, cb) {
// //     const uniqueSuffix = Date.now();
// //     cb(null, uniqueSuffix + ".jpg");
// //   },
// });
const storage = multer.memoryStorage();
exports.upload = multer({
  storage: storage,
  limits: 1024 * 1024,
});

exports.getBase = async (req, res) => {
  const datos = await db.collection("gateways").get();
  const gateways = datos.docs.map((doc) => ({ idf: doc.id, ...doc.data() }));
  res.json({ res: "success", gateways: gateways, cantidad: gateways.length });
};

exports.getUserByUid = async (req, res) => {
  const uid = req.params.uid;

  const datos = await admin.auth().getUser(uid);
  const email = datos.email;
  res.json({
    email: email,
    datos: datos,
  });
};

exports.createGateway = async (req, res) => {
  const uid = req.body.uid;
  try {
    const datos = await admin.auth().getUser(uid);
    if (datos) {
      const datosDb = await db.collection("gateways");
      const snapshot = await datosDb.where("uid", "==", uid).get();
      if (snapshot.size === 0) {
        const newGateway = {
          uid: uid,
          id: genMacs(),
          name: "GatewayDefault",
          ipv4: genSingleIp(0),
          devices: [],
          img: "",
        };
        let test = await db
          .collection("gateways")
          .doc(newGateway.id)
          .create(newGateway);
        console.log(
          "🚀 ~ file: gatewayControllers.js ~ line 38 ~ exports.createGateway= ~ test",
          test
        );
        return res.json({ status: true, gateway: newGateway });
      }
      const gateway = snapshot.docs[0];
      console.log(
        "🚀 ~ file: gatewayControllers.js ~ line 41 ~ exports.createGateway= ~ gateway",
        gateway
      );
      res.json({ status: true, gateway: gateway.data() });
    }
  } catch (error) {
    res.json({ status: false, error: error });
  }
};

exports.updateGateway = async (req, res) => {
  const gateway = req.body;
  console.log(
    "🚀 ~ file: gatewayControllers.js ~ line 61 ~ exports.updateGateway= ~ gateway",
    gateway
  );
  //aqui se agrega en el admin el update
  try {
    await db.collection("gateways").doc(gateway.id).update(gateway);
    res.json({
      status: true,
    });
  } catch (error) {
    res.json({
      status: false,
      error: error,
    });
  }
};

exports.uploadImagen = async (req, res, next) => {
  if (!req.file)
    return res.json({ status: false, error: "no hay ninguna imagen" });

  const imagen = req.file;
  console.log(
    "🚀 ~ file: gatewayControllers.js ~ line 99 ~ exports.uploadImagen= ~ imagen",
    imagen
  );
  const nombreImagen = `${Date.now()}.${imagen.originalname.split(".")[1]}`;

  const file = bucket.file(nombreImagen);
  const stream = file.createWriteStream({
    metadata: {
      contentType: imagen.mimetype,
    },
  });
  stream.on("error", (e) => console.log(e));
  stream.on("finish", async () => {
    await file.makePublic();
    imagen.firebaseUrl = `https>//storage.googleapis.com/${BucketUrl}/${nombreImagen}`;
    
    res.json({ status: true });
  });
  stream.end(imagen.buffer);
  console.log("imagen cargada correcatamente ", nombreImagen);

};

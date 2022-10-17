const { admin, db, bucket, BucketUrl } = require("../firebase");
const { genMacs, genSingleIp } = require("../helpers/genMacAndIpv4");

const multer = require("multer");
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
  console.log("esta entrando aqui");
  const datos = await admin.auth().getUser(uid);
  const email = datos.email;
  res.json({
    email: email,
    datos: datos,
  });
};

exports.getUserByEmailApi = async (req, res) => {
  const email = req.params.email;

  try {
    const datos = await admin.auth().getUserByEmail(email);
    res.json({
      datos: datos,
    });
  } catch (error) {
    res.json({ status: false, error: error });
  }
};
exports.getValidateUserByEmail = async (req, res) => {
  const email = req.params.email;

    await admin.auth().updateUser;
  try {
    const datos = await admin.auth().getUserByEmail(email);
    if (datos.providerData[0].providerId == "password") {
      res.json({
        status: true,
        uid: datos.uid
      });
    }
    res.json({
        status: false,
        mensaje:'usuario creado por otro metodo que no es password'
    });
  } catch (error) {
      if (error.code == "auth/user-not-found") { 
          res.json({
              status: false,
              mensaje:'usuario no registrado'
          });
      }
        console.log(
          "🚀 ~ file: gatewayControllers.js ~ line 54 ~ exports.getValidateUserByEmail= ~ error",
          error
        );
  }
};
exports.updatePasswordUserByUid = async (req, res) => {
    let { uid, password } = req.body
    try {
        await admin.auth().updateUser(uid, { password: password });
        res.json({
            status: true,
            mensaje: 'Password cambiado exitosamente'
        })
        
    } catch (error) {
        res.json({
          status: false,
          mensaje: error,
        });
    }
 } 
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
        return res.json({ status: true, gateway: newGateway });
      }
      const gateway = snapshot.docs[0];
      res.json({ status: true, gateway: gateway.data() });
    }
  } catch (error) {
    res.json({ status: false, error: error });
  }
};

exports.updateGateway = async (req, res) => {
  const gateway = req.body;
  //aqui se agrega en el admin el update
  const respuesta = await updateG(gateway);
  res.json({ ...respuesta });
};

const updateG = async (gateway) => {
  try {
    await db.collection("gateways").doc(gateway.id).update(gateway);
    return {
      status: true,
    };
  } catch (error) {
    return {
      status: false,
      error: error,
    };
  }
};
exports.uploadImagen = async (req, res, next) => {
  if (!req.files["imagen"][0])
    return res.json({ status: false, error: "no hay ninguna imagen" });

  const { uid } = req.body;
  const datosDb = await db.collection("gateways");
  const snapshot = await datosDb.where("uid", "==", uid).get();
  const gateway = snapshot.docs[0].data();
  const imagen = req.files["imagen"][0];
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
    imagen.firebaseUrl = `https://storage.googleapis.com/${BucketUrl}/${nombreImagen}`;
    gateway.img = imagen.firebaseUrl;
    await updateG(gateway);
    res.json({ status: true, gateway: gateway });
  });
  stream.end(imagen.buffer);
  console.log("imagen cargada correcatamente ", nombreImagen);
};

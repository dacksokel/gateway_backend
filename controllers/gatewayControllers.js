const { admin, db, bucket, BucketUrl, fbAdmin } = require("../firebase");
const { genMacs, genSingleIp } = require("../helpers/genMacAndIpv4");
const busboy = require("busboy");
const { v4: uuidv4 } = require("uuid");
const multer = require("multer");
const path = require("path");
const os = require("os");
const fs = require("fs");

// const storage = multer.memoryStorage();
// exports.upload = multer({
//   storage: storage,
//   limits: 1024 * 1024,
// });;

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
        uid: datos.uid,
      });
    }
    res.json({
      status: false,
      mensaje: "usuario creado por otro metodo que no es password",
    });
  } catch (error) {
    if (error.code == "auth/user-not-found") {
      res.json({
        status: false,
        mensaje: "usuario no registrado",
      });
    }
  }
};
exports.updatePasswordUserByUid = async (req, res) => {
  let { uid, password } = req.body;
  try {
    await admin.auth().updateUser(uid, { password: password });
    res.json({
      status: true,
      mensaje: "Password cambiado exitosamente",
    });
  } catch (error) {
    res.json({
      status: false,
      mensaje: error,
    });
  }
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
  console.log("aqui llega");

  let uid = "",
    fileImagen;

  const bb = busboy({ headers: req.headers });
  const tmpdir = os.tmpdir();
  // This object will accumulate all the fields, keyed by their name
  const fields = {};

  // This object will accumulate all the uploaded files, keyed by their name.
  const uploads = {};

  // This code will process each non-file field in the form.
  bb.on("field", (fieldname, val) => {
    /**
     *  TODO(developer): Process submitted field values here
     */
    if (fieldname == "uid") uid = val;
    // console.log(`Processed field ${fieldname}: ${val}.`);
    fields[fieldname] = val;
  });

  const fileWrites = [];

  // This code will process each file uploaded.
  bb.on("file", (fieldname, file, info) => {
    fileImagen = { fieldname, file, info };
    // Note: os.tmpdir() points to an in-memory file system on GCF
    // Thus, any files in it must fit in the instance's memory.
    console.log(`Processed file ${info.filename}`);

    const filepath = path.join(process.cwd() + "/uploads/" + info.filename);
    uploads[fieldname] = filepath;

    const writeStream = fs.createWriteStream(filepath);
    file.pipe(writeStream);

    file.on("end", () => {
      console.log("File [" + info.fieldname + "] Finished sucessfully");
    });

    writeStream.on("error", function (err) {
      console.log("fstream error" + err);
      file.unpipe();
    });
    writeStream.on("close", async function () {
      let gateway = await uploadStorageF(uid, fileImagen);
      fs.unlinkSync(uploads[fieldname]);
      res.status(200);
      res.json({ status: true, gateway: gateway });
    });
  });

  bb.end(req.rawBody);


};

const uploadStorageF = async (uid, fileImagen) => {
  const uuid = uuidv4();
  const datosDb = await db.collection("gateways");
  const snapshot = await datosDb.where("uid", "==", uid).get();
  const gateway = snapshot.docs[0].data();
  const metadata = {
    metadata: {
      contentType: fileImagen.info.mimeType,
      firebaseStageDownloadTokens: uuid,
    },
    contentType: fileImagen.info.mimeType,
    cacheControl: "public, max-age=31536000",
  };
  await bucket.upload(path.join("uploads", fileImagen.info.filename), {
    gzip: true,
    metadata: metadata,
    public: true,
  });
  gateway.img = `https://storage.googleapis.com/${BucketUrl}/${fileImagen.info.filename}`;  
  await updateG(gateway);
  return gateway
};

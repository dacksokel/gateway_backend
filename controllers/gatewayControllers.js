const { admin, db } = require("../firebase");
const { genMacs, genSingleIp } = require("../helpers/genMacAndIpv4");

exports.getBase = async (req, res) => {
  const datos = await db.collection("gateways").get();
  const gateways = datos.docs.map((doc) => ({ idf: doc.id, ...doc.data() }));
  res.json({ res: "success", gateways: gateways });
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
          console.log("🚀 ~ file: gatewayControllers.js ~ line 28 ~ exports.createGateway= ~ snapshot", snapshot.size)
        const newGateway = {
          uid: uid,
          id: genMacs(),
          name: "GatewayDefault",
          ipv4: genSingleIp(0),
          devices: [],
          img: "",
        };
        await db.collection("gateways").add(newGateway);
        return res.json({ status: true, gateway: newGateway });
      }
      const gateway = snapshot.docs[0].data();
      res.json({ status: true, gateway: gateway });
    }
  } catch (error) {
    res.json({ status: false, error: error });
  }
};

exports.updateGateway = async (req, res) => {
  const gateway = req.body.gateway;
  //aqui se agrega en el admin el update
  res.json({
    status: true,
  });
};

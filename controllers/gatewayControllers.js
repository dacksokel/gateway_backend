const { admin, db } = require("../firebase");
const { genMacs, genSingleIp } = require("../helpers/genMacAndIpv4");

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
  console.log("🚀 ~ file: gatewayControllers.js ~ line 61 ~ exports.updateGateway= ~ gateway", gateway)
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

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
    const datosDb = await db.collection("gateways").get();
    const gateways = datosDb.docs.map((doc) => ({ ...doc.data() }));
    const prefixIp = gateways.length;
    if (datos.uid === uid && gateways.length > 0) {
      const gateway = datosDb.docs.find((doc) => doc.data().uid === uid);
      res.json({
        status: true,
        gateway: gateway.data(),
      });
    } else {
      const newGateway = {
        uid: uid,
        id: genMacs(),
        name: "GatewayDefault",
        ipv4: genSingleIp(prefixIp),
        devices: [],
        img: "",
      };
      await db.collection("gateways").add(newGateway);
      res.json({ status: true, gateway: newGateway });
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

const admin = require("../firebase");
const { genMacs, genSingleIp } = require("../helpers/genMacAndIpv4");
exports.getBase = async (req, res) => {
  res.json({ res: "success" });
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
    console.log("🚀 ~ file: gatewayControllers.js ~ line 20 ~ exports.createGateway= ~ req.body", req.body)
  const uid = req.body.uid;
  console.log("🚀 ~ file: gatewayControllers.js ~ line 20 ~ exports.createGateway= ~ uid", uid)
  const datos = await admin.auth().getUser(uid);
  if (datos.uid === uid) {
    const newGateway = {
      uid: uid,
      id: genMacs(),
      name: "GatewayDefault",
      ipv4: genSingleIp(0),
      devices: [],
    };
    res.json({ status: true, gateway: newGateway });
  }
  //   const userUid = datos.uid;
  res.json({ status: false });
};
exports.updateGateway = async (req, res) => {
  const gateway = req.body.gateway;
  //aqui se agrega en el admin el update
  res.json({
    status: true,
  });
};

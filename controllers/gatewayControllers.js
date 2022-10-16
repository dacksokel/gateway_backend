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
  const uid = req.body.uid;
  try {
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
  } catch (error) {
    res.json({ status: false });
  }
};
exports.updateGateway = async (req, res) => {
  const gateway = req.body.gateway;
  //aqui se agrega en el admin el update
  res.json({
    status: true,
  });
};

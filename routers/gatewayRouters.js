const router = require("express").Router();
const cors = require("cors")
const {
  getBase,
  getUserByUid,
  createGateway,
  updateGateway,
  uploadImagen,
  upload,
  getUserByEmailApi,
  getValidateUserByEmail,
  updatePasswordUserByUid,
} = require("../controllers/gatewayControllers");

router.get("/", getBase);
router.get("/:uid", getUserByUid);
router.get("/email/:email", getUserByEmailApi);
router.get("/emailValidate/:email", getValidateUserByEmail);
router.post("/creategateway", createGateway);
router.post("/updategateway", updateGateway);
router.post("/updatepassword", updatePasswordUserByUid);
router.post(
  "/uploadimg",
  cors({ origin: "*", methods: "POST" }),
  uploadImagen
);

module.exports = router;

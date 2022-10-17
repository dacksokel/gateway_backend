const router = require("express").Router();
const {
  getBase,
  getUserByUid,
  createGateway,
  updateGateway,
  uploadImagen,
  upload,
  getUserByEmailApi,
  getValidateUserByEmail,
} = require("../controllers/gatewayControllers");

router.get("/", getBase);
router.get("/:uid", getUserByUid);
router.get("/email/:email", getUserByEmailApi);
router.get("/emailValidate/:email", getValidateUserByEmail);
router.post("/creategateway", createGateway);
router.post("/updategateway", updateGateway);
router.post(
  "/uploadimg",
  upload.fields([
    { name: "uid" },
    { name: "imagen" },
  ]),
  uploadImagen
);

module.exports = router;

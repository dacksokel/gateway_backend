const router = require("express").Router();
const {
  getBase,
  getUserByUid,
  createGateway,
  updateGateway,
  uploadImagen,
  upload,
} = require("../controllers/gatewayControllers");

router.get("/", getBase);
router.get("/:uid", getUserByUid);
router.post("/creategateway", createGateway);
router.post("/updategateway", updateGateway);
router.post("/uploadimg", upload.single("imagen"), uploadImagen);

module.exports = router;

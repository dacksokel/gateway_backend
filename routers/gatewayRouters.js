const router = require("express").Router();
const {getBase, getUserByUid, createGateway, updateGateway} = require('../controllers/gatewayControllers')

router.get('/', getBase)
router.get('/:uid', getUserByUid)
router.post('/creategateway', createGateway)
router.post('/updategateway', updateGateway)

module.exports= router;
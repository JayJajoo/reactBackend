const { saveNewAddress , getAllAddress } = require("../controllers/ckeckoutController")
const router = require("express").Router()
router.post("/saveNewAddress",saveNewAddress)
router.post("/getAllAddress",getAllAddress)
module.exports = router
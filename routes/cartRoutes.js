const { addToCart , removeFromCart , getFullCartDetail } = require("../controllers/cartController")

const router = require("express").Router()

router.post("/addToCart",addToCart)
router.post("/removeFromCart",removeFromCart)
router.post("/getFullCartDetail",getFullCartDetail)
module.exports = router
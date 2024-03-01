const {getFullStockReport , getOutOfStockProducts  , getProductByProductId} = require("../controllers/stockController")

const router = require("express").Router()

router.post("/getFullStockReport",getFullStockReport)
router.post("/getOutOfStockProducts",getOutOfStockProducts)
router.post("/getProductByProductId",getProductByProductId)

module.exports = router


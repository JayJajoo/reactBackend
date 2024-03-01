const {getIsCartAvailable,  getSessionId , checkPaymentStatus , addToOrders,getAllOrders,editOrderStatus,fetchFilteredOrders,getOrderById,getOrderDetails , getReplaceOptions  , placeReplaceRequest} = require("../controllers/orderController")

const router = require("express").Router()

router.post("/addToOrders",addToOrders)
router.post("/getSessionId",getSessionId)
router.post("/getIsCartAvailable",getIsCartAvailable)
router.post("/getAllOrders",getAllOrders)
router.put("/editOrderStatus",editOrderStatus)
router.post("/fetchFilteredOrders",fetchFilteredOrders)
router.post("/getOrderById",getOrderById)
router.get("/getOrderDetails/:orderId",getOrderDetails)
router.post("/getReplaceOptions",getReplaceOptions)
router.post("/placeReplaceRequest",placeReplaceRequest)
router.get("/checkPaymentStatus/:orderid/:userId",checkPaymentStatus)
module.exports = router
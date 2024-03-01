const {createUser,checkUser,resetPassword, getUser ,generateOTP , forgotPassword } = require("../controllers/authController")

const router = require("express").Router()

router.post("/createUser",createUser)
router.post("/checkUser",checkUser)
router.put("/resetPassword",resetPassword)
router.get("/getUser/:email",getUser)
router.post("/generateOTP",generateOTP)
router.put("/forgotPassword",forgotPassword)
module.exports = router
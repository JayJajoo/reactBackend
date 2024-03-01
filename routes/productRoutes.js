const { createProducts, getAllProducts, getSelectedProducts , getProduct , deleteProduct ,editProduct , getHSNDesc , getProductWithSameProdCode} = require("../controllers/productController")

const router = require("express").Router()
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/addProduct", upload.array('image', 4), createProducts);
router.get("/getAllProducts",getAllProducts)
router.post("/getSelectedProducts",getSelectedProducts)
router.get("/getProduct/:prodId",getProduct)
router.post("/deleteProduct",deleteProduct)
router.put("/editProduct",editProduct)
router.get("/getHSNDesc/:HSNCODE",getHSNDesc)
router.get(`/getProductWithSameProdCode/:prodCode`,getProductWithSameProdCode);
module.exports = router
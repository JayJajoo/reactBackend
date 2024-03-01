const {getTotalUsers , getRepeatRate , getAverageOrderValue , 
      getStockByBrand ,getStockByCategory, getStockByColour ,
      getStockBySize , getTodaysCollection, getDayWiseSales ,
      getSalesByCategory , getSalesByBrand , getSalesByColour ,
      getSalesBySize , getSalesByCity , getSalesByState ,
      getTotalCollection , getMonthsCollection } = require("../controllers/dashboardController")

const router = require("express").Router()
router.get("/getMonthsCollection/:userId",getMonthsCollection)
router.get("/getTotalUsers/:userId",getTotalUsers)
router.get("/getRepeatRate/:userId",getRepeatRate)
router.get("/getAverageOrderValue/:userId",getAverageOrderValue)
router.get("/getStockByBrand/:userId",getStockByBrand)
router.get("/getStockByCategory/:userId",getStockByCategory)
router.get("/getStockByColour/:userId",getStockByColour)
router.get("/getStockBySize/:userId",getStockBySize)
router.get("/getTodaysCollection/:userId",getTodaysCollection)
router.get("/getDayWiseSales/:userId/:startDate/:endDate", getDayWiseSales);
router.get("/getSalesByCategory/:userId/:startDate/:endDate", getSalesByCategory);
router.get("/getSalesByBrand/:userId/:startDate/:endDate", getSalesByBrand);
router.get("/getSalesByColour/:userId/:startDate/:endDate", getSalesByColour);
router.get("/getSalesBySize/:userId/:startDate/:endDate", getSalesBySize);
router.get("/getSalesByCity/:userId/:startDate/:endDate", getSalesByCity);
router.get("/getSalesByState/:userId/:startDate/:endDate", getSalesByState);
router.get("/getTotalCollection/:userId/:startDate/:endDate", getTotalCollection);


module.exports = router

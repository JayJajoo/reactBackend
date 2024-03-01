const users = require("../model/UserModel")
const products = require("../model/ProdDetailModel")

module.exports.getFullStockReport = async (req, res, next) => {
    try {
        const { userId } = req.body
        const user = await users.findById(userId)
        if (user == undefined || user.role != "admin") {
            throw "Only Admin can access this page!!"
        }
        else {
            const allProds = await products.find({})
            res.json(allProds)
            return
        }
    } catch (err) {
        res.status(500).send({
            msg: err
        })
    }
}

module.exports.getOutOfStockProducts = async (req, res, next) => {
    try {
        const { userId, filters } = req.body
        const user = await users.findById(userId)
        if (user == undefined || user.role != "admin") {
            throw "Only Admin can access this page!!"
        }
        else {
            const sizeToIndex = { "S": 0, "M": 1, "L": 2, "XL": 3, "2XL": 4 };
            const allProds = await products.find({});
            const filteredProds = allProds.reduce((filtered, currentProd, index) => {
                let outOfStock = false; // Change to let instead of const
                filters.forEach((size) => { // Use forEach instead of map since map is used for transforming elements
                    const stock = currentProd.stock[sizeToIndex[size]];
                    if (stock == 0) {
                        outOfStock = true;
                    }
                });
                if (outOfStock) {
                    filtered.push(currentProd); 
                }
                return filtered;
            }, []);
            res.json(filteredProds);
            return;

        }
    } catch (err) {
        res.status(500).send({
            msg: err
        })
    }
}

module.exports.getProductByProductId = async (req, res, next) => {
    try {
        const { userId, productId } = req.body
        console.log(productId)
        const user = await users.findById(userId)
        if (user == undefined || user.role != "admin") {
            throw "Only Admin can access this page!!"
        }
        else {
            const product = await products.find({_id:productId})
            res.json(product);
            return;

        }
    } catch (err) {
        res.status(500).send({
            msg: err
        })
    }
}


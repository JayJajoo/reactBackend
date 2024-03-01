const products = require("../model/ProdDetailModel")
const AWS = require('aws-sdk');
const multer = require('multer');
const storage = multer.memoryStorage();
const users = require("../model/UserModel");
const hsn = require("../model/HSNModel");

const mongoose = require('mongoose');
const upload = multer({ storage });
const ObjectId = mongoose.Types.ObjectId

require("dotenv").config();

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESS_KEY_ID,
    secretAccessKey: process.env.SECRET_ACCESS_kEY,
    region: 'us-east-1',
});

const filterByProdCode = (products) => {
    const uniqueProducts = [];
    const seenProdCodes = {};

    products.forEach((product) => {
        if (!seenProdCodes[product.prodCode]) {
            uniqueProducts.push(product);
            seenProdCodes[product.prodCode] = true;
        }
    });

    return uniqueProducts
}

module.exports.createProducts = async (req, res) => {
    try {
        const { brand, category, color, description, detail, discountPercentage, highlight, stock, size, price, rating, title ,HSN_Code , prodCode } = req.body;
        const uploadPromises = req.files.map(async (file, index) => {
            const params = {
                Bucket: 'jaygarments',
                Key: `products/${title}-${color}/image${index + 1}.jpg`,
                Body: file.buffer,
                ContentType: file.mimetype,
            };
            const uploadResult = await s3.upload(params).promise();
            return uploadResult.Location;
        });
        const imageUrls = await Promise.all(uploadPromises);
        const product = await products.create({
            title, HSN_Code , brand, category, color, description, detail, discountPercentage, highlight: highlight.split(","), stock, size, price, rating, title , prodCode,
            images: imageUrls, thumbnail: imageUrls[0]
        })
        console.log(prodCode)
        res.json(product)
    } catch (error) {
        console.error('Error creating product:', error);
        res.json({});
    }
};

module.exports.getAllProducts = async (req, res, next) => {
    const allProducts = await products.find({})
    if (allProducts) {
        res.send(filterByProdCode(allProducts))
    }
    else {
        res.status(400).json({
            msg: "Fetch failed"
        })
    }
}

module.exports.getProduct = async (req, res) => {
    const { prodId } = req.params
    const Product = await products.findOne({ _id: prodId })
    const prodCode = Product.prodCode
    const colorOptions = await products.find({ prodCode: prodCode })
    if (Product) {
        res.send({ product: Product, colorOptions: colorOptions.map((prod) => { return ({ _id: prod._id, color: prod.color }) }) })
    }
    else {
        res.status(400).json({
            msg: "Fetch failed"
        })
    }
}

module.exports.deleteProduct = async (req, res, next) => {
    const { prodId } = req.body
    const prod = await products.findById(prodId)
    const userList = prod.addedToCartByUsers.map((id) => ObjectId(id))
    const updatedUsers = await users.updateMany(
        { _id: { $in: userList } },
        { $pull: { productsInCart: { productId: prodId } } },
        { new: true }
    );
    const Product = await products.findByIdAndDelete({ _id: prodId })
    const allProducts = await products.find({})
    if (allProducts) {
        res.send(filterByProdCode(allProducts))
    }
    else {
        res.status(400).json({
            msg: "Fetch failed"
        })
    }
}


module.exports.getSelectedProducts = async (req, res, next) => {
    try {
        const { category, brand, size, color } = req.body
        const filter = {};
        if (category && category.length > 0) {
            filter.category = category;
        }
        if (brand && brand.length > 0) {
            filter.brand = brand;
        }
        if (color && color.length > 0) {
            filter.color = color;
        }
        const selectedProducts = await products.find(filter);
        if (size && size.length > 0) {
            const sizeIndex = size.map((sz) => {
                if (sz == "S") {
                    return 0
                }
                if (sz == "M") {
                    return 1
                }
                if (sz == "L") {
                    return 2
                }
                if (sz == "XL") {
                    return 3
                }
                if (sz == "2XL") {
                    return 4
                }
            })
            const sizeSelectedProducts = selectedProducts.filter((prod) => {
                var isAvailable = false
                sizeIndex.forEach(index => {
                    if (prod.stock[index] == 0) {
                        isAvailable = isAvailable | false
                    }
                    else{
                        isAvailable = isAvailable | true
                    }
                });
                if (isAvailable) {
                    return prod
                }

            })
            res.status(200).json(filterByProdCode(sizeSelectedProducts))
            return;
        }

        if (selectedProducts) {
            res.send(filterByProdCode(selectedProducts))
            return;
        }
        else {
            res.json({
                msg: "No products available!!!"
            })
            return;
        }
    } catch (err) {
        // console.log(err)
    }
}

module.exports.editProduct = async (req, res, next) => {
    const { _id, brand, category, color, description, detail, discountPercentage, highlight, stock, size, price, rating, title , prodCode} = req.body
    const updatedHighlight = highlight.split(".,").map((item) => item + ".")
    const updatedProduct = await products.findByIdAndUpdate({ _id: _id }, {
        brand, category, color, description, detail, discountPercentage, highlight: updatedHighlight, stock, size, price, rating, title , prodCode
    }, { new: true })
    res.json(updatedProduct)
}

module.exports.getHSNDesc = async (req, res, next) => {
    try {
        const { HSNCODE } = req.params
        const descp = await hsn.findOne({ HSN_Code: HSNCODE });
        if (descp) {
            res.json({ msg: descp.HSN_Description });
        } else {
            res.json({ msg: "No description found." });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.json({ msg: 'Error fetching data:' })
    }
}

module.exports.getProductWithSameProdCode = async (req, res, next) => {
    try {
        const { prodCode } = req.params
        const product = await products.findOne({ prodCode: prodCode });
        if (product) {
            console.log(product)
            res.json(product);
        } else {
            throw ("No prior product with this product code found.")
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send({ msg:error})
    }
}
const orders = require("../model/OrderModel")
const users = require("../model/UserModel")
const Products = require("../model/ProdDetailModel")
const ObjectId = require("mongodb").BSONType.objectId
const axios = require("axios")
var nodemailer = require("nodemailer")
const ejs = require('ejs');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');


const editedOrderStatus = (orderId,status) => {
    return (
        `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Order Status</title>
            <style>
                /* Styles for the email body */
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f0f0f0;
                    margin: 0;
                    padding: 0;
                    text-align: center;
                }
                /* Styles for the container */
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    padding: 20px;
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                /* Styles for the header */
                .header {
                    background-color: #007bff;
                    color: #ffffff;
                    padding: 20px;
                    border-radius: 10px 10px 0 0;
                }
                /* Styles for the status message */
                .status-message {
                    font-size: 18px;
                    margin-bottom: 20px;
                }
                /* Styles for the button */
                .button {
                    display: inline-block;
                    background-color: #007bff;
                    color: #ffffff;
                    padding: 10px 20px;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                }
                .button:hover {
                    background-color: #0056b3;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Order Status</h1>
                </div>
                <div class="content">
                    <p class="status-message">Your order ${orderId} has been <strong>${status}</strong>!</p>
                    <!-- You can customize the status message as needed -->
                    <!-- <a href="https://example.com" class="button">Track Your Order</a> -->
                    <!-- Add a button or link to track the order -->
                </div>
            </div>
        </body>
        </html>
        `
    )
}

const sendMail = (email,subject,html) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_ID,
            pass: process.env.PASSWORD
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_ID,
        to: email,
        subject: subject,
        html:html
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

function mergeReturns(array) {
    // To merge items having the same id and size  
    const mergedArray = array.reduce((acc, curr) => {
        const existingItem = acc.find(item => item._id === curr._id && item.size === curr.size);
        if (existingItem) {
            // Create a new object with the merged quantity
            const newItem = { ...existingItem, quantity: existingItem.quantity + curr.quantity };
            // Replace the existing item with the new merged item
            acc = acc.map(item => (item._id === existingItem._id && item.size === existingItem.size) ? newItem : item);
        } else {
            // If the item doesn't exist in the accumulator array, add it
            acc.push(curr);
        }
        return acc;
    }, []);

    return mergedArray;
}

function mergeFilteredOrders(array,role) {
    // To merge items having the same id and size  
    if(role=="admin"){
        const mergedArray = array.reduce((acc, curr) => {
            const existingItem = acc.findIndex(item => item._id.toString() == curr._id.toString());
            if (existingItem==-1) {
                acc.push(curr)
            } 
            return acc;
        }, []);
        return mergedArray;
    }
    else if(role=="user"){
        const mergedArray = array.reduce((acc, curr) => {
            const existingItem = acc.findIndex(item => item.orderId.toString() == curr.orderId.toString());
            if (existingItem==-1) {
                acc.push(curr)
            } 
            return acc;
        }, []);
        return mergedArray;
    }
}


module.exports.getSessionId = async(req,res)=>{
    try{
        const {orderId , userId , address , totalValue} = req.body
        const data = {
            customer_details: {
              customer_id: userId,
              customer_email: address.email,
              customer_phone: address.phoneNumber,
              customer_name: `${address.firstName} ${address.lastName}`
            }, 
            order_meta: {
                notify_url: "https://webhook.site/728fad1a-a7c6-44da-916d-174c988c82aa",
                payment_methods: 'cc,dc,upi'
            },
            order_id: orderId,
            order_amount: totalValue,
            order_currency: 'INR'
          };
          
          const config = {
            headers: {
              'accept': 'application/json',
              'content-type': 'application/json',
              'x-api-version': '2023-08-01',
              'x-client-id': process.env.CASHFREE_APP_ID,
              'x-client-secret': process.env.CASHFREE_SECRET
            }
          };
          
        const response = await axios.post('https://sandbox.cashfree.com/pg/orders', data, config)
        res.json(response.data.payment_session_id)
        return;
        
    }catch(err){
        res.json({
            msg:err.message
        })
    }
}

const returnStockQuantity = async (userId) =>{
    try{
        const orderAwaited = await users.findById(userId)
        var orderData = orderAwaited._doc.orderAwaitingPayment
        const sizeIndex = { "S": 0, "M": 1, "L": 2, "XL": 3, "2XL": 4 }
        const products = orderData.productsPurchased
        for (const prod of products) {
            try {
                const product = await Products.findById(prod._id);
                if (product) {
                    const updatedStock = [...product.stock];
                    const sizeIdx = sizeIndex[prod.size];
                    if (sizeIdx !== undefined) {
                        updatedStock[sizeIdx] += prod.quantity;
                        await Products.findByIdAndUpdate(prod._id, { $set: { "stock": updatedStock } });
                    } else {
                        throw new error(`Invalid size index for product with ID ${prod._id}`);
                    }
                } else {
                    throw new error(`Product with ID ${prod._id} not found`);
                }
            } catch (error) {
                throw new error(`Error updating product with ID ${prod._id}: ${error.message}`);
            }
        }

        const user = await users.findByIdAndUpdate({ _id: userId }, {
            $set: { "orderAwaitingPayment": {} }
        }, {
            new: true
        })
        return 
    }catch(err){
        console.log(err)
        return;
    }
}

const generateFinalOrder = async (userId,paymentDetails) =>{
    try{
    const orderAwaited = await users.findById(userId)
    var orderData = orderAwaited._doc.orderAwaitingPayment
    orderData.paymentDetails = paymentDetails
    const sizeIndex = { "S": 0, "M": 1, "L": 2, "XL": 3, "2XL": 4 }
    const products = orderData.productsPurchased
    for (const prod of products) {
        try {
            const product = await Products.findById(prod._id);
            if (product) {
                const updatedUnitsSold = [...product.unitsSold] 
                const sizeIdx = sizeIndex[prod.size];
                if (sizeIdx !== undefined) {
                    updatedUnitsSold[sizeIdx] += prod.quantity
                    await Products.findByIdAndUpdate(prod._id, { $set: {"unitsSold":updatedUnitsSold } });
                } else {
                    throw (`Invalid size index for product with ID ${prod._id}`);
                    return;
                }
            } else {
                throw (`Product with ID ${prod._id} not found`);
                return;
            }
        } catch (error) {
            throw (`Error updating product with ID ${prod._id}: ${error.message}`);
            return;
        }
    }

    const data = await orders.create({...orderData}) 
    const keysToRemove = ['userId', '__v'];
    const filteredOrder = Object.keys(data._doc).reduce((acc, key) => {
        if (!keysToRemove.includes(key)) {
            if (key === "_id") {
                acc["orderId"] = data._doc[key]
            }
            else {
                acc[key] = data._doc[key];
            }
        }
        return acc;
    }, {});

    const user = await users.findByIdAndUpdate({ _id: userId }, {
        $push: {
            "productsPurchased": filteredOrder
        },
        $set: { "productsInCart": [] }
    }, {
        new: true
    })
    
    const orderTemplate = fs.readFileSync("controllers/Templates/Order.ejs","utf-8");
    const renderedOrderHTML = ejs.render(orderTemplate, { products: products , totalBill : ((1+data._doc.tax/100)*data._doc.totalProductsValue + data._doc.shippingCharges).toFixed(2)});
    sendMail(user._doc.email,`Purchase Summary for Order ${data._doc._id}`,renderedOrderHTML)
        return ({
            success:true,
            ORDERID:data._doc._id
        })
    }catch(err){
        return ({
            success:false,
        })
    }
}

module.exports.checkPaymentStatus = async(req,res)=>{
    const {orderid,userId} = req.params
    try {
        const options = {
            method: 'GET',
            url: `https://sandbox.cashfree.com/pg/orders/${orderid}`,
            headers: {
                accept: 'application/json',
                'x-api-version': '2022-09-01',              
                'x-client-id': process.env.CASHFREE_APP_ID,
                'x-client-secret': process.env.CASHFREE_SECRET
            }
        };

        await axios.request(options).then(async function (response) {
            if(response.data.order_status === "PAID"){
                const data = await generateFinalOrder(userId , response.data)
                if(data.success){
                    res.redirect(`${process.env.ORDER_LINK}/${data.ORDERID}`)
                    return ;
                }
                else{
                     res.redirect(process.env.CHECKOUT_LINK)
                    return ;
                }
            } else if(response.data.order_status === "ACTIVE"){
                const data = await returnStockQuantity(userId)
                res.redirect(process.env.CART_LINK)
                return ;
            } else{
                const data = await returnStockQuantity(userId)
                 res.redirect(process.env.CART_LINK)
                 return 
            }
        })
        .catch(function (error) {   
            return console.error(error);
        });
       
    } catch (error) {
        res.status(500).send({
            message: error.message,
            success: false
        })
    }
}

module.exports.getIsCartAvailable = async (req, res) => {
    const { products, userId, address , totalProductsValue, tax, shippingCharges, totalValue } = req.body
    try {
        const allProductsInCart = await Products.find({ _id: { $in: products.map((prod) => prod._id) } });

        const prodIDMapToIndex = allProductsInCart.reduce((acc, prod, index) => {
            acc[prod._id.toString()] = index;
            return acc;
        }, {});

        const orderedStock = products.map((prod) => prod.quantity);

        const availableStock = products.map((orderedProduct) => {
            const prodIndex = prodIDMapToIndex[orderedProduct._id.toString()];
            const sizeIndex = allProductsInCart[prodIndex].size.findIndex((sz) => sz === orderedProduct.size);
            return allProductsInCart[prodIndex].stock[sizeIndex];
        });

        const allStockAvailable = availableStock.every((stock, index) => stock >= orderedStock[index]);

        if (allStockAvailable) {
            const data = {
                userId: userId,
                name: `${address.firstName} ${address.lastName}`,
                email: address.email,
                phoneNumber: address.phoneNumber,
                address: {
                    streetAddress: address.streetAddress,
                    city: address.city,
                    state: address.state,
                    country: address.country,
                    postalCode: address.postalCode
                },
                productsPurchased: products,
                finalPurchase:products,
                totalProductsValue: totalProductsValue,
                tax: tax,
                shippingCharges: shippingCharges,
                totalValue: totalValue,
                dateOfPurchase:new Date().toUTCString(),
                status: "Received",
                paymentDetails: {}
            }

            const sizeIndex = { "S": 0, "M": 1, "L": 2, "XL": 3, "2XL": 4 }

            for (const prod of products) {
                try {
                    const product = await Products.findById(prod._id);
                    if (product) {
                        const updatedStock = [...product.stock];
                        const sizeIdx = sizeIndex[prod.size];
                        if (sizeIdx !== undefined) {
                            updatedStock[sizeIdx] -= prod.quantity;
                            await Products.findByIdAndUpdate(prod._id, { $set: { "stock": updatedStock } });
                        } else {
                            throw new error(`Invalid size index for product with ID ${prod._id}`);
                        }
                    } else {
                        throw new error(`Product with ID ${prod._id} not found`);
                    }
                } catch (error) {
                    throw new error(`Error updating product with ID ${prod._id}: ${error.message}`);
                }
            }

            const user = await users.findByIdAndUpdate({ _id: userId }, {
                $set: { "orderAwaitingPayment": data }
            }, {
                new: true
            })
        
            res.json(true);
            return
        }
        else {
            const updatedCart = products.reduce((updates, prod, index) => {
                if (availableStock[index] > 0) {
                    if (orderedStock[index] >= availableStock[index]) {
                        return [...updates, { productId: prod._id, size: prod.size, quantity: availableStock[index] }];
                    } else {
                        return [...updates, { productId: prod._id, size: prod.size, quantity: orderedStock[index] }];
                    }
                }
                return updates;
            }, []);

            const user = await users.findByIdAndUpdate({ _id: userId }, { $set: { "productsInCart": updatedCart } }, { new: true })
            throw ("Updated your cart as some products stock limt reached.")
            return;
        }


    } catch (err) {
        console.log(err)
        res.status(500).send({
            msg: err
        })
    }
}

module.exports.addToOrders = async (req, res) => {
    const { products, userId, address , totalProductsValue, tax, shippingCharges, totalValue } = req.body
    try {
        const allProductsInCart = await Products.find({ _id: { $in: products.map((prod) => prod._id) } });

        const prodIDMapToIndex = allProductsInCart.reduce((acc, prod, index) => {
            acc[prod._id.toString()] = index;
            return acc;
        }, {});

        const orderedStock = products.map((prod) => prod.quantity);

        const availableStock = products.map((orderedProduct) => {
            const prodIndex = prodIDMapToIndex[orderedProduct._id.toString()];
            const sizeIndex = allProductsInCart[prodIndex].size.findIndex((sz) => sz === orderedProduct.size);
            return allProductsInCart[prodIndex].stock[sizeIndex];
        });

        const allStockAvailable = availableStock.every((stock, index) => stock >= orderedStock[index]);

        if (allStockAvailable) {
            const data = await orders.create({
                userId: userId,
                name: `${address.firstName} ${address.lastName}`,
                email: address.email,
                phoneNumber: address.phoneNumber,
                address: {
                    streetAddress: address.streetAddress,
                    city: address.city,
                    state: address.state,
                    country: address.country,
                    postalCode: address.postalCode
                },
                productsPurchased: products,
                finalPurchase:products,
                totalProductsValue: totalProductsValue,
                tax: tax,
                shippingCharges: shippingCharges,
                totalValue: totalValue,
                dateOfPurchase:new Date().toUTCString(),
                status: "Received",
                paymentDetails: {}
            })

            const keysToRemove = ['userId', '__v'];

            const filteredOrder = Object.keys(data._doc).reduce((acc, key) => {
                if (!keysToRemove.includes(key)) {
                    if (key === "_id") {
                        acc["orderId"] = data._doc[key]
                    }
                    else {
                        acc[key] = data._doc[key];
                    }
                }
                return acc;
            }, {});

            const sizeIndex = { "S": 0, "M": 1, "L": 2, "XL": 3, "2XL": 4 }

            for (const prod of products) {
                try {
                    const product = await Products.findById(prod._id);
                    if (product) {
                        const updatedStock = [...product.stock];
                        const updatedUnitsSold = [...product.unitsSold] 
                        const sizeIdx = sizeIndex[prod.size];
                        if (sizeIdx !== undefined) {
                            updatedStock[sizeIdx] -= prod.quantity;
                            updatedUnitsSold[sizeIdx] += prod.quantity
                            await Products.findByIdAndUpdate(prod._id, { $set: { "stock": updatedStock ,"unitsSold":updatedUnitsSold } });
                        } else {
                            throw new error(`Invalid size index for product with ID ${prod._id}`);
                        }
                    } else {
                        throw new error(`Product with ID ${prod._id} not found`);
                    }
                } catch (error) {
                    throw new error(`Error updating product with ID ${prod._id}: ${error.message}`);
                }
            }

            const user = await users.findByIdAndUpdate({ _id: userId }, {
                $push: {
                    "productsPurchased": filteredOrder
                },
                $set: { "productsInCart": [] }
            }, {
                new: true
            })
            
            const orderTemplate = fs.readFileSync("controllers/Templates/Order.ejs","utf-8");
            const renderedOrderHTML = ejs.render(orderTemplate, { products: products , totalBill : ((1+tax/100)*totalProductsValue + shippingCharges).toFixed(2)});
            sendMail(user._doc.email,`Purchase Summary for Order ${data._doc._id}`,renderedOrderHTML)
            res.json(data._doc._id)
            return;
        }
        else {
            const updatedCart = products.reduce((updates, prod, index) => {
                if (availableStock[index] > 0) {
                    if (orderedStock[index] >= availableStock[index]) {
                        return [...updates, { productId: prod._id, size: prod.size, quantity: availableStock[index] }];
                    } else {
                        return [...updates, { productId: prod._id, size: prod.size, quantity: orderedStock[index] }];
                    }
                }
                return updates;
            }, []);

            const user = await users.findByIdAndUpdate({ _id: userId }, { $set: { "productsInCart": updatedCart } }, { new: true })
            throw ("Updated your cart as some products stock limt reached .")
        }


    } catch (err) {
        console.log(err)
        res.status(500).send({
            msg: err
        })
    }
}

module.exports.getAllOrders = async (req, res) => {
    try {
        const { userId } = req.body
        const userData = await users.findById(userId)
        if (userData.role === "user") {
            res.json(userData.productsPurchased)
        }
        else if (userData.role === "admin") {
            const allOrders = await orders.find({})
            res.json(allOrders)
        }
    } catch (err) {
        res.json({
            message: "Orders Fetch Failed"
        })
    }
}

module.exports.editOrderStatus = async (req, res) => {
    try {
        const { userId, orderId, status } = req.body;
        var updatedStatus = {}
        if (status == "Dispatched") {
            updatedStatus.status = status
            updatedStatus.dateOfDispatch = Date(),
            updatedStatus.dateOfDelivery = null
        }
        else if (status == "Delivered") {
            updatedStatus.status = status
            updatedStatus.dateOfDelivery = Date()
        }

        const order = await orders.findByIdAndUpdate({ _id: orderId },
            { $set: { ...updatedStatus } },
            { new: true }
        );

        const user = await users.findOne({ _id: userId })
        
        const htmlText = editedOrderStatus(orderId,status)

        sendMail(user.email,`Order : ${orderId} - ${status}`,htmlText)

        var ords = user.productsPurchased.map((ord) => {
            if (ord.orderId == orderId) {
                ord.status = status
                if (status == "Dispatched") {
                    ord.dateOfDispatch = Date(),
                    ord.dateOfDelivery = null
                }
                else if (status == "Delivered") {
                    ord.dateOfDelivery = Date()
                }
            }
            return (ord)
        })
        const updatedUser = await users.findByIdAndUpdate({ _id: userId }, { $set: { "productsPurchased": ords } }, { new: true })
        const allOrders = await orders.find({});
        res.json(allOrders);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Orders Fetch Failed"
        });
    }
};

module.exports.fetchFilteredOrders = async (req, res, next) => {
    try {
        const { filters, userId } = req.body
        const user = await users.findById(userId)
        if (user.role == "admin") {
            var replacements = []
            if(filters.findIndex((filter)=>filter=="Replacement")!=-1){
                replacements = await orders.find({ replacementRequestRaised:true});
            }
            const selectedOrders = await orders.find({ status: filters });
            const updatedArray = mergeFilteredOrders([...replacements,...selectedOrders],"admin")
            res.json(updatedArray)
            return;
        }
        else if (user.role == "user") {
            var replacements = []
            if(filters.findIndex((filter)=>filter=="Replacement")!=-1){
                replacements = user.productsPurchased.filter((order) => {
                    if (filters.findIndex((filter) => order.replacementRequestRaised == true) != -1) {
                        return order
                    }
                })
            }
            const selectedOrders = user.productsPurchased.filter((order) => {
                if (filters.findIndex((filter) => order.status == filter) != -1) {
                    return order
                }
            })
            const updatedArray = mergeFilteredOrders([...replacements,...selectedOrders],"user")
            res.json(updatedArray)
            return;
        }
    } catch (err) {
        res.json({
            msg: "Fetch failed"
        })
    }
}

module.exports.getOrderById = async (req, res, next) => {
    try {
        const { userId, orderId } = req.body
        const user = await users.findById(userId)
        if (user.role == "admin") {
            const selectedOrders = await orders.findById({ _id: orderId });
            res.json([selectedOrders])
        }
        else if (user.role == "user") {
            const selectedOrders = user.productsPurchased.filter((order) => {
                if (order.orderId == orderId) {
                    return order
                }
            })
            res.json(selectedOrders)
        }
    } catch (err) {
        res.json({
            msg: "Fetch failed"
        })
    }
}

module.exports.getOrderDetails = async (req, res, next) => {
    try {
        const { orderId } = req.params
        const order = await orders.findById(orderId)
        res.json(order)
    } catch (err) {
        res.json({
            msg: "Fetch failed"
        })
    }
}

module.exports.getReplaceOptions = async (req, res, next) => {
    try {
        const { prodCodeArray } = req.body
        const products = await Products.find({ prodCode: { $in: prodCodeArray } })
        res.json(products)

    } catch (err) {
        res.status(500).send({
            msg: "Fetching Replacement Options Failed!!"
        })
    }
}

module.exports.placeReplaceRequest = async (req, res, next) => {
    try {
        const { orderId, returnedItems, replacedItems } = req.body;

        const order = await orders.findById(orderId);
        let prodsPurchased = [...order.productsPurchased];

        const productsReplaced = await Products.find({ _id: { $in: replacedItems.map((itm) => itm._id) } })
        var originalProductsReplaced = [...productsReplaced]
        replacedItems.forEach((repItm) => {
            const index = originalProductsReplaced.findIndex((orgProd) => (orgProd._id == repItm._id));
            const sizeReturnedIndex = originalProductsReplaced[index].size.findIndex((orgSize) => orgSize == repItm.size)
            if (originalProductsReplaced[index].stock[sizeReturnedIndex] < repItm.quantity) {
                throw (`Replacement ${repItm.title} - ${repItm.color} has only ${originalProductsReplaced[index].stock[sizeReturnedIndex]} units left in size ${repItm.size}.`)
                return;
            }
            else {
                originalProductsReplaced[index].stock[sizeReturnedIndex] -= repItm.quantity
            }
        });
        for (const prod of originalProductsReplaced) {
            await Products.findByIdAndUpdate({ _id: prod._id }, { $set: { stock: prod.stock , unitsSold:prod.unitsSold } }, { new: true })
        }

        //To increase products return quantity
        const productsRetured = await Products.find({ _id: { $in: returnedItems.map((itm) => itm._id) } })
        var originalProductsReturned = [...productsRetured]
        returnedItems.forEach((retItm) => {
            const index = originalProductsReturned.findIndex((orgProd) => (orgProd._id == retItm._id));
            const sizeReturnedIndex = originalProductsReturned[index].size.findIndex((orgSize) => orgSize == retItm.size)
            originalProductsReturned[index].stock[sizeReturnedIndex] += retItm.quantity
        });
        for (const prod of originalProductsReturned) {
            await Products.findByIdAndUpdate({ _id: prod._id }, { $set: { stock: prod.stock , unitsSold:prod.unitsSold } }, { new: true })
        }

        returnedItems.forEach((retItm) => {
            const index = prodsPurchased.findIndex((prdPur) => (prdPur._id == retItm._id && prdPur.size == retItm.size));
            if (index !== -1) {
                if (prodsPurchased[index].quantity === retItm.quantity) {
                    prodsPurchased.splice(index,1);
                } else if (prodsPurchased[index].quantity > retItm.quantity) {
                    prodsPurchased[index].quantity -= retItm.quantity;
                }
            }
        });

        const updatedProductsPurchased = mergeReturns([...replacedItems, ...prodsPurchased]);
        
        const updatedOrder = await orders.findByIdAndUpdate(orderId, {
            $set: {
                "finalPurchase": updatedProductsPurchased,
                "productsReturned": returnedItems,
                "productsReplaced": replacedItems,
                "replacementRequestRaised": true,
                status: "Received",
                dateOfDispatch: null,
                dateOfDelivery: null
            }
        }, { new: true })
        
        const returnTemplate = fs.readFileSync("controllers/Templates/UpdatedOrder.ejs","utf-8");
        const renderedRetrunHTML = ejs.render(returnTemplate, { 
            returnedItems:returnedItems , 
            replacedItems:replacedItems ,
            totalBill : updatedOrder._doc.totalValue
        })
        sendMail(order._doc.email,`Replacement Summary for Order ${orderId}`,renderedRetrunHTML)
        
        var originalProductsReplaced = [...productsReplaced]
        replacedItems.forEach((repItm) => {
            const index = originalProductsReplaced.findIndex((orgProd) => (orgProd._id == repItm._id));
            const sizeReturnedIndex = originalProductsReplaced[index].size.findIndex((orgSize) => orgSize == repItm.size)
            if (originalProductsReplaced[index].stock[sizeReturnedIndex] < repItm.quantity) {
                throw (`Replacement ${repItm.title} - ${repItm.color} has only ${originalProductsReplaced[index].stock[sizeReturnedIndex]} units left in size ${repItm.size}.`)
            }
            else {
                originalProductsReplaced[index].unitsSold[sizeReturnedIndex] += repItm.quantity
            }
        });
        for (const prod of originalProductsReplaced) {
            await Products.findByIdAndUpdate({ _id: prod._id }, { $set: { stock: prod.stock , unitsSold:prod.unitsSold } }, { new: true })
        }

        //To increase products return quantity
        var originalProductsReturned = [...productsRetured]
        returnedItems.forEach((retItm) => {
            const index = originalProductsReturned.findIndex((orgProd) => (orgProd._id == retItm._id));
            const sizeReturnedIndex = originalProductsReturned[index].size.findIndex((orgSize) => orgSize == retItm.size)
            originalProductsReturned[index].unitsSold[sizeReturnedIndex] -= retItm.quantity
        });
        for (const prod of originalProductsReturned) {
            await Products.findByIdAndUpdate({ _id: prod._id }, { $set: { stock: prod.stock , unitsSold:prod.unitsSold } }, { new: true })
        }

        const user = await users.findById(updatedOrder.userId);
        var allOrders = [...user.productsPurchased];
        const orderIndex = allOrders.findIndex((order) => order.orderId == orderId);
        if (orderIndex != -1) {
            const { _id, __v, ...toUpdateObject } = updatedOrder;
            var newOrder = { orderId: orderId, ...toUpdateObject._doc };
            allOrders[orderIndex] = { ...newOrder };
        }
        const updateUser = await users.findByIdAndUpdate(updatedOrder.userId, { $set: { productsPurchased: allOrders } }, { new: true });
        res.json(updatedOrder);
        return;
    } catch (err) {
        console.log(err)
        res.status(500).send({msg:err});
    }
};


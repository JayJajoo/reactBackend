const users = require("../model/UserModel")
const products = require("../model/ProdDetailModel")
const orders = require("../model/OrderModel")

const getLabelsAndData = (array) => {
    const labels = [];
    const dataArray = [];

    array.forEach(item => {
        labels.push(item._id);
        dataArray.push(item.data);
    });

    return ({
        labels: labels,
        data: dataArray
    })
}

module.exports.getTotalCollection = async (req, res, next) => {
    try {
        const { userId, startDate, endDate } = req.params
        const user = await users.findById(userId)
        if (!user || user.role != 'admin') {
            throw ("Unauthorized access!!.")
        }

        const matchStage = {};

        if (startDate != -1 && endDate != -1) {
            matchStage.dateOfPurchase = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate != -1) {
            matchStage.dateOfPurchase = {
                $gte: new Date(startDate)
            };
        } else if (endDate != -1) {
            matchStage.dateOfPurchase = {
                $lte: new Date(endDate)
            };
        }

        const groupStage = {
            $group: {
              _id: null,
              totalValue: {
                $sum: "$totalValue"
              },
              shippingCharges:{
                $sum:"$shippingCharges"
              }
            }
          }
        
        const addFieldStage = {
            $addFields: {
              data: {
                $subtract:["$totalValue","$shippingCharges"]
              }
            }
          }


        const pipeline = [];
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }
        
        pipeline.push(groupStage);
        pipeline.push(addFieldStage)

        const result = await orders.aggregate(pipeline);
        // console.log(result)
        res.json(result[0].data);
        return;
    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}

module.exports.getSalesByState = async (req, res, next) => {
    try {
        const { userId, startDate, endDate } = req.params
        const user = await users.findById(userId)
        if (!user || user.role != 'admin') {
            throw ("Unauthorized access!!.")
        }

        const matchStage = {};

        if (startDate != -1 && endDate != -1) {
            matchStage.dateOfPurchase = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate != -1) {
            matchStage.dateOfPurchase = {
                $gte: new Date(startDate)
            };
        } else if (endDate != -1) {
            matchStage.dateOfPurchase = {
                $lte: new Date(endDate)
            };
        }
        const unwindStage1 = {
            $unwind: {
              path: "$address", // Unwind the address array
            },
          }
        
        const unwindStage2 = {
            $unwind: {
              path: "$productsPurchased"
            }
        }

        const groupStage = {
            $group: {
                _id: "$address.state",
                data: {
                    $sum: {
                        $multiply: [
                            { $add: [1, { $divide: ["$tax", 100] }] },
                            { $multiply: [{ $subtract: [1, { $divide: ["$productsPurchased.discountPercentage", 100] }] }, { $multiply: ["$productsPurchased.price", "$productsPurchased.quantity"] }] }
                        ]
                    }
                }
            }
        }


        const pipeline = [];
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }
        
        pipeline.push(unwindStage1);
        pipeline.push(unwindStage2);
        pipeline.push(groupStage);

        const result = await orders.aggregate(pipeline);
        // console.log(result)
        res.json(getLabelsAndData(result));
        return;
    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}

module.exports.getSalesByCity = async (req, res, next) => {
    try {
        const { userId, startDate, endDate } = req.params
        const user = await users.findById(userId)
        if (!user || user.role != 'admin') {
            throw ("Unauthorized access!!.")
        }

        const matchStage = {};

        if (startDate != -1 && endDate != -1) {
            matchStage.dateOfPurchase = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate != -1) {
            matchStage.dateOfPurchase = {
                $gte: new Date(startDate)
            };
        } else if (endDate != -1) {
            matchStage.dateOfPurchase = {
                $lte: new Date(endDate)
            };
        }
        const unwindStage1 = {
            $unwind: {
              path: "$address", // Unwind the address array
            },
          }
        
        const unwindStage2 = {
            $unwind: {
              path: "$productsPurchased"
            }
        }

        const groupStage = {
            $group: {
                _id: "$address.city",
                data: {
                    $sum: {
                        $multiply: [
                            { $add: [1, { $divide: ["$tax", 100] }] },
                            { $multiply: [{ $subtract: [1, { $divide: ["$productsPurchased.discountPercentage", 100] }] }, { $multiply: ["$productsPurchased.price", "$productsPurchased.quantity"] }] }
                        ]
                    }
                }
            }
        }


        const pipeline = [];
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }
        
        pipeline.push(unwindStage1);
        pipeline.push(unwindStage2);
        pipeline.push(groupStage);

        const result = await orders.aggregate(pipeline);
        // console.log(result)
        res.json(getLabelsAndData(result));
        return;
    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}

module.exports.getSalesByCategory = async (req, res, next) => {
    try {
        const { userId, startDate, endDate } = req.params
        const user = await users.findById(userId)
        if (!user || user.role != 'admin') {
            throw ("Unauthorized access!!.")
        }

        const matchStage = {};

        if (startDate != -1 && endDate != -1) {
            matchStage.dateOfPurchase = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate != -1) {
            matchStage.dateOfPurchase = {
                $gte: new Date(startDate)
            };
        } else if (endDate != -1) {
            matchStage.dateOfPurchase = {
                $lte: new Date(endDate)
            };
        }
        const unwindStage = {
            $unwind: {
                path: "$productsPurchased",
            }
        }
        const groupStage = {
            $group: {
                _id: "$productsPurchased.category",
                data: {
                    $sum: {
                        $multiply: [
                            { $add: [1, { $divide: ["$tax", 100] }] },
                            { $multiply: [{ $subtract: [1, { $divide: ["$productsPurchased.discountPercentage", 100] }] }, { $multiply: ["$productsPurchased.price", "$productsPurchased.quantity"] }] }
                        ]
                    }
                }
            }
        }


        const pipeline = [];
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }
        
        pipeline.push(unwindStage);
        pipeline.push(groupStage);

        const result = await orders.aggregate(pipeline);
        // console.log(result)
        res.json(getLabelsAndData(result));
        return;
    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}

module.exports.getSalesByBrand = async (req, res, next) => {
    try {
        const { userId, startDate, endDate } = req.params
        const user = await users.findById(userId)
        if (!user || user.role != 'admin') {
            throw ("Unauthorized access!!.")
        }

        const matchStage = {};

        if (startDate != -1 && endDate != -1) {
            matchStage.dateOfPurchase = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate != -1) {
            matchStage.dateOfPurchase = {
                $gte: new Date(startDate)
            };
        } else if (endDate != -1) {
            matchStage.dateOfPurchase = {
                $lte: new Date(endDate)
            };
        }
        const unwindStage = {
            $unwind: {
                path: "$productsPurchased",
            }
        }
        const groupStage = {
            $group: {
                _id: "$productsPurchased.brand",
                data: {
                    $sum: {
                        $multiply: [
                            { $add: [1, { $divide: ["$tax", 100] }] },
                            { $multiply: [{ $subtract: [1, { $divide: ["$productsPurchased.discountPercentage", 100] }] }, { $multiply: ["$productsPurchased.price", "$productsPurchased.quantity"] }] }
                        ]
                    }
                }
            }
        }

        const pipeline = [];
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }
        
        pipeline.push(unwindStage);
        pipeline.push(groupStage);

        const result = await orders.aggregate(pipeline);
        // console.log(result)
        res.json(getLabelsAndData(result));
        return;
    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}

module.exports.getSalesByColour = async (req, res, next) => {
    try {
        const { userId, startDate, endDate } = req.params
        const user = await users.findById(userId)
        if (!user || user.role != 'admin') {
            throw ("Unauthorized access!!.")
        }

        const matchStage = {};

        if (startDate != -1 && endDate != -1) {
            matchStage.dateOfPurchase = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate != -1) {
            matchStage.dateOfPurchase = {
                $gte: new Date(startDate)
            };
        } else if (endDate != -1) {
            matchStage.dateOfPurchase = {
                $lte: new Date(endDate)
            };
        }
        const unwindStage = {
            $unwind: {
                path: "$productsPurchased",
            }
        }
        const groupStage = {
            $group: {
                _id: "$productsPurchased.color",
                data: {
                    $sum: {
                        $multiply: [
                            { $add: [1, { $divide: ["$tax", 100] }] },
                            { $multiply: [{ $subtract: [1, { $divide: ["$productsPurchased.discountPercentage", 100] }] }, { $multiply: ["$productsPurchased.price", "$productsPurchased.quantity"] }] }
                        ]
                    }
                }
            }
        }


        const pipeline = [];
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }
        
        pipeline.push(unwindStage);
        pipeline.push(groupStage);

        const result = await orders.aggregate(pipeline);
        // console.log(result)
        res.json(getLabelsAndData(result));
        return;
    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}

module.exports.getSalesBySize= async (req, res, next) => {
    try {
        const { userId, startDate, endDate } = req.params
        const user = await users.findById(userId)
        if (!user || user.role != 'admin') {
            throw ("Unauthorized access!!.")
        }

        const matchStage = {};

        if (startDate != -1 && endDate != -1) {
            matchStage.dateOfPurchase = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate != -1) {
            matchStage.dateOfPurchase = {
                $gte: new Date(startDate)
            };
        } else if (endDate != -1) {
            matchStage.dateOfPurchase = {
                $lte: new Date(endDate)
            };
        }
        const unwindStage = {
            $unwind: {
                path: "$productsPurchased",
            }
        }
        const groupStage = {
            $group: {
                _id: "$productsPurchased.size",
                data: {
                    $sum: {
                        $multiply: [
                            { $add: [1, { $divide: ["$tax", 100] }] },
                            { $multiply: [{ $subtract: [1, { $divide: ["$productsPurchased.discountPercentage", 100] }] }, { $multiply: ["$productsPurchased.price", "$productsPurchased.quantity"] }] }
                        ]
                    }
                }
            }
        }


        const pipeline = [];
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }
        
        pipeline.push(unwindStage);
        pipeline.push(groupStage);

        const result = await orders.aggregate(pipeline);
        // console.log(result)
        res.json(getLabelsAndData(result));
        return;
    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}

module.exports.getDayWiseSales = async (req, res, next) => {
    try {
        const { userId, startDate, endDate } = req.params
        const user = await users.findById(userId)
        if (!user || user.role != 'admin') {
            throw ("Unauthorized access!!.")
        }

        const matchStage = {};

        if (startDate != -1 && endDate != -1) {
            matchStage.dateOfPurchase = {
                $gte: new Date(startDate),
                $lte: new Date(endDate)
            };
        } else if (startDate != -1) {
            matchStage.dateOfPurchase = {
                $gte: new Date(startDate)
            };
        } else if (endDate != -1) {
            matchStage.dateOfPurchase = {
                $lte: new Date(endDate)
            };
        }

        const groupStage = {
            $group: {
                _id: {
                    $dateToString: {
                        format: "%Y-%m-%d",
                        date: {
                            $toDate: {
                                $add: ["$dateOfPurchase", 5.5 * 60 * 60 * 1000] // Add timezone offset (in milliseconds) to convert UTC to local time
                            }
                        }
                    }
                },
                data: {
                    $sum: {
                        $multiply: ["$totalProductsValue", { $add: [1, { $divide: ["$tax", 100] }] }]
                    }
                }
            }
        };

        const pipeline = [];
        if (Object.keys(matchStage).length > 0) {
            pipeline.push({ $match: matchStage });
        }
        pipeline.push({ $sort: { dateOfPurchase: -1 } });
        pipeline.push({ $limit: 30 });
        pipeline.push(groupStage);
        const result = await orders.aggregate(pipeline);
        const sortedResult = result.sort((a, b) => {
            return new Date(a._id) - new Date(b._id);
        });
        res.json(getLabelsAndData(sortedResult));
        return;
    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}

module.exports.getTodaysCollection = async (req, res, next) => {
    try {
        const { userId } = req.params
        const user = await users.findById(userId)
        if (!user || user.role != 'admin') {
            throw ("Unauthorized access!!.")
        }
        const totalCollection = await orders.aggregate(
            [
                {
                    $match: {
                        dateOfPurchase: {
                            $gte: new Date(new Date().setHours(0, 0, 0, 0)), // Beginning of today
                            $lte: new Date(new Date().setHours(23, 59, 59, 999)) // End of today
                        }
                    }
                },
                {
                    $group: {
                        _id: null,
                        data: {
                            $sum: {
                                $multiply: ["$totalProductsValue", { $add: [1, { $divide: ["$tax", 100] }] }]
                            }
                        }
                    }
                }
            ]
        )
        res.json(totalCollection[0].data)
    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}

module.exports.getMonthsCollection = async (req, res, next) => {
    try {
        const { userId } = req.params
        const user = await users.findById(userId)
        if (!user || user.role != 'admin') {
            throw ("Unauthorized access!!.")
        }
        const totalCollection = await orders.aggregate(
            [
                {
                  $match: {
                    $expr: {
                      $and: [
                        { $eq: [{ $year: "$dateOfPurchase" }, new Date().getFullYear()] }, // Filter by year
                        { $eq: [{ $month: "$dateOfPurchase" }, new Date().getMonth() + 1] }, // Filter by month (1-indexed)
                      ]
                    }
                  }
                },
                {
                    $group: {
                      _id: null,
                      totalValue: {
                        $sum: "$totalValue"
                      },
                      shippingCharges:{
                        $sum:"$shippingCharges"
                      }
                    }
                  },
                  {
                    $addFields: {
                      data: {
                        $subtract:["$totalValue","$shippingCharges"]
                      }
                    }
                  }
            ]
        )
        res.json(totalCollection[0].data)
    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}

module.exports.getTotalUsers = async (req, res, next) => {
    try {
        const { userId } = req.params
        const user = await users.findById(userId)
        if (!user || user.role != 'admin') {
            throw ("Unauthorized access!!.")
        }
        const totalUsers = await users.aggregate(
            [
                {
                    $match: {
                        "role": "user",
                    }
                },
                {
                    '$group': {
                        '_id': null,
                        'count': {
                            '$sum': 1
                        }
                    }
                }
            ]
        )
        res.json(totalUsers[0].count)
    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}

module.exports.getAverageOrderValue = async (req, res, next) => {
    try {
        const { userId } = req.params
        const user = await users.findById(userId)
        if (!user || user.role != 'admin') {
            throw ("Unauthorized access!!.")
        }
        const averageOrderValue = await users.aggregate(
            [
                {
                    $match: {
                        role: "user",
                    },
                },
                {
                    $unwind: {
                        path: "$productsPurchased",
                    },
                },
                {
                    $group: {
                        _id: null,
                        averageTotalValue: {
                            $avg: "$productsPurchased.totalValue"
                        },
                        averageShippingCharges: {
                            $avg: "$productsPurchased.shippingCharges"
                        }
                    }
                },
                {
                    $addFields: {
                        averageOrderValue: {
                            $subtract: ["$averageTotalValue", "$averageShippingCharges"]
                        }
                    }
                }
            ]
        )
        res.json(averageOrderValue[0].averageOrderValue)
    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}

module.exports.getRepeatRate = async (req, res, next) => {
    try {
        const { userId } = req.params
        const user = await users.findById(userId)
        if (!user || user.role != 'admin') {
            throw ("Unauthorized access!!.")
        }
        const repeats = await orders.aggregate([
            {
                $group: {
                    _id: "$userId",
                    totalOrders: {
                        $sum: 1
                    }
                },
            },
            {
                $match: {
                    "totalOrders": { $gt: 1 }
                }
            }
        ])
        const totalUsers = await orders.aggregate([
            {
                $group: {
                    _id: "$userId"
                },
            }
        ])
        res.json(repeats.length * 100 / totalUsers.length)
    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}

module.exports.getStockByBrand = async (req, res, next) => {
    try {
        const { userId } = req.params
        const user = await users.findById(userId)
        if (!user || user.role != 'admin') {
            throw ("Unauthorized access!!.")
        }
        const stockReport = await products.aggregate(
            [
                {
                    $unwind: {
                        path: "$size"
                    }
                },
                {
                    $addFields: {
                        sizeIndex: {
                            $indexOfArray: [["S", "M", "L", "XL", "2XL"], "$size"]
                        }
                    }
                },
                {
                    $group: {
                        _id: "$brand",
                        data: {
                            $sum: { $arrayElemAt: ["$stock", "$sizeIndex"] }
                        }
                    }
                },
                {
                    $sort: {
                        "data": 1
                    }
                }
            ]
        )
        res.json(getLabelsAndData(stockReport))
    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}

module.exports.getStockByCategory = async (req, res, next) => {
    try {
        const { userId } = req.params
        const user = await users.findById(userId)
        if (!user || user.role != 'admin') {
            throw ("Unauthorized access!!.")
        }
        const stockReport = await products.aggregate(
            [
                {
                    $unwind: {
                        path: "$size"
                    }
                },
                {
                    $addFields: {
                        sizeIndex: {
                            $indexOfArray: [["S", "M", "L", "XL", "2XL"], "$size"]
                        }
                    }
                },
                {
                    $group: {
                        _id: "$category",
                        data: {
                            $sum: { $arrayElemAt: ["$stock", "$sizeIndex"] }
                        }
                    }
                },
                {
                    $sort: {
                        "data": 1
                    }
                }
            ]
        )
        res.json(getLabelsAndData(stockReport))
    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}

module.exports.getStockByColour = async (req, res, next) => {
    try {
        const { userId } = req.params
        const user = await users.findById(userId)
        if (!user || user.role != 'admin') {
            throw ("Unauthorized access!!.")
        }
        const stockReport = await products.aggregate(
            [
                {
                    $unwind: {
                        path: "$size"
                    }
                },
                {
                    $addFields: {
                        sizeIndex: {
                            $indexOfArray: [["S", "M", "L", "XL", "2XL"], "$size"]
                        }
                    }
                },
                {
                    $group: {
                        _id: "$color",
                        data: {
                            $sum: { $arrayElemAt: ["$stock", "$sizeIndex"] }
                        }
                    }
                },
                {
                    $sort: {
                        "data": 1
                    }
                }
            ]
        )
        res.json(getLabelsAndData(stockReport))
    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}

module.exports.getStockBySize = async (req, res, next) => {
    try {
        const { userId } = req.params
        const user = await users.findById(userId)
        if (!user || user.role != 'admin') {
            throw ("Unauthorized access!!.")
        }
        const stockReport = await products.aggregate(
            [
                {
                    $unwind: {
                        path: "$size"
                    }
                },
                {
                    $addFields: {
                        sizeIndex: {
                            $indexOfArray: [["S", "M", "L", "XL", "2XL"], "$size"]
                        }
                    }
                },
                {
                    $group: {
                        _id: "$size",
                        data: {
                            $sum: { $arrayElemAt: ["$stock", "$sizeIndex"] }
                        }
                    }
                },
                {
                    $sort: {
                        "data": 1
                    }
                }
            ]

        )
        res.json(getLabelsAndData(stockReport))
    } catch (err) {
        res.status(500).send({
            msg: err.message
        })
    }
}





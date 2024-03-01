const users = require("../model/UserModel")

module.exports.saveNewAddress = async (req, res, next) => {
    const {address,userId} = req.body
    const data = await users.findByIdAndUpdate(
        { _id: userId },
        { $push: { address: address } },
        { new: true }
      );    
    res.json(data.address)
}

module.exports.getAllAddress = async (req, res, next) => {
    const {userId} = req.body
    const data = await users.findById(
        { _id: userId }
      );    
    res.json(data.address)
}
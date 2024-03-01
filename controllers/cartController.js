const users = require("../model/UserModel")
const product = require("../model/ProdDetailModel")

module.exports.addToCart = async (req, res, next) => {
  try {
    const { userId, productId, size, quantity } = req.body;
    const getProd = await product.findById(productId)
    const stock = getProd.stock[getProd.size.findIndex((sz) => sz == size)]
    const user = await users.findById(userId);
    const existingProductIndex = user.productsInCart.findIndex(
      (item) => item.productId == productId && item.size == size
    );
    if (existingProductIndex !== -1) {
      if (user.productsInCart[existingProductIndex].quantity + quantity > stock) {
        throw "Stock limit exceeded!!"
      }
      const data = await users.findOneAndUpdate(
        { _id: userId, productsInCart: { $elemMatch: { productId: productId, size: size } } },
        { $inc: { 'productsInCart.$.quantity': quantity } },
        { new: true }
      );
      const addUserIdToProd = await product.findByIdAndUpdate({ _id: productId }, { $push: { "addedToCartByUsers": userId } })
      res.json(data.productsInCart)
      return;
    } else {
      const data = await users.findByIdAndUpdate({ _id: userId }, { $push: { "productsInCart": { productId: productId, size: size, quantity: 1 } } }, { new: true });
      const prod = await product.findById(productId);
      if (!prod.addedToCartByUsers.includes(userId)) {
        const addUserIdToProd = await product.findByIdAndUpdate(
          { _id: productId },
          { $push: { addedToCartByUsers: userId } }
        );
      }
      res.json(data.productsInCart)
      return;
    }
  } catch (error) {
    res.status(500).send({ msg: error });
    return;
  }
};


module.exports.removeFromCart = async (req, res, next) => {
  try {
    const { userId, productId, size, quantity } = req.body;
    const user = await users.findById(userId);
    const existingProductIndex = user.productsInCart.findIndex(
      (item) => item.productId == productId && item.size == size
    );
    if (existingProductIndex !== -1) {
      if (user.productsInCart[existingProductIndex].quantity - quantity >= 1) {
        user.productsInCart[existingProductIndex].quantity -= quantity;
      } else {
        user.productsInCart.splice(existingProductIndex, 1);
        const removeUserIdFromProd = await product.findByIdAndUpdate({ _id: productId }, { $pull: { "addedToCartByUsers": userId } })
      }
      const data = await users.findOneAndUpdate({ _id: userId }, { $set: { productsInCart: user.productsInCart } }, { new: true });
      res.json(data.productsInCart);
    }
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ msg: 'Internal Server Error' });
  }
};



module.exports.getFullCartDetail = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const userData = await users.findById({ _id: userId });
    const initialDetail = userData.productsInCart;
    const ids = Array.from(new Set(initialDetail.map((detail) => detail.productId)));

    const fullProductData = await product.find({ _id: { $in: ids } });

    const sizeIndex = { S: 0, M: 1, L: 2, XL: 3, '2XL': 4 };

    const fullCartData = await Promise.all(initialDetail.map(async (detail) => {
      const product = fullProductData.find((prod) => prod._id.toString() === detail.productId);
      const sizeStock = product.stock[sizeIndex[detail.size]];
      return {
        ...product,
        size: detail.size,
        stock: sizeStock,
        quantity: detail.quantity,
      };
    }));

    const productDetails = fullCartData.map(item => ({
      _id: item._doc._id,
      title: item._doc.title,
      HSN_Code: item._doc.HSN_Code,
      description: item._doc.description,
      price: item._doc.price,
      discountPercentage: item._doc.discountPercentage,
      rating: item._doc.rating,
      color: item._doc.color,
      brand: item._doc.brand,
      category: item._doc.category,
      thumbnail: item._doc.thumbnail,
      prodCode: item._doc.prodCode,
      detail: item._doc.detail,
      images: item._doc.images,
      highlight: item._doc.highlight,
      stock: item.stock,
      size: item.size,
      quantity: item.quantity
    }));
    res.json(productDetails);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


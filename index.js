const productRoutes = require("./routes/productRoutes")
const authRoutes = require("./routes/authRoutes")
const cartRoutes = require("./routes/cartRoutes")
const checkoutRoutes = require("./routes/checkoutRoutes")
const orderRoutes = require("./routes/orderRoutes")
const stockRoutes = require("./routes/stockRoutes")
const dashboardRoutes = require("./routes/dashboardRoutes")


const express=require('express')
const cors=require('cors')
const mongoose=require('mongoose')

const app=express();

require("dotenv").config();
app.use(cors({
    origin:"*",    
}));

app.use(express.json())
app.use("/api/product",productRoutes)
app.use("/api/auth",authRoutes)
app.use("/api/cart",cartRoutes)
app.use("/api/checkout",checkoutRoutes)
app.use("/api/order",orderRoutes)
app.use("/api/stock",stockRoutes)
app.use("/api/dashboard",dashboardRoutes)

app.get("/api/health", (req, res) => {
    res.status(200).json({ status: "OK", message: "Server is healthy!" });
});

mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
}).then(()=>{
    console.log("Database connection successful")
}).catch((err)=>{
    console.log(err.message);
});

const server = app.listen(process.env.PORT || 5000,()=>{
    console.log(`Server started on port ${process.env.PORT}`)
})


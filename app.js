require('dotenv').config();
const express= require("express");
const app= express();
const mongoose = require ('mongoose');
var cors = require('cors')
const userRoutes= require("./routes/userRoutes");
//connectDb import;
const connectDB= require("./config/connectdb");

const PORT = process.env.PORT || 3001;
const DATABASE_URL= process.env.DATABASE_URL;

//Cors policy
app.use(cors());

//json
app.use(express.json());

//routes
app.use("/api/user", userRoutes);

//Database Connection
connectDB(DATABASE_URL);

 
app.listen(PORT, ()=>{
    console.log(`Server is running on port ${PORT}`);
});
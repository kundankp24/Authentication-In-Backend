const mongoose = require ('mongoose');

const connectDB=async (DATABASE_URL)=>{
    try {
        const DB_OPTIONS={
            dbName: "geekshop"
        }
        return await mongoose.connect(DATABASE_URL, DB_OPTIONS);
        console.log("Connected successfully");
    } catch (error) {
        console.log(error);
    }
}
module.exports=connectDB;
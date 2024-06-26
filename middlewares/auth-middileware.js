var jwt = require('jsonwebtoken');
const UserModel= require("../models/User");

var checkUserAuth=async (req, res, next)=>{
    let token;
    const {authorization}= req.headers;
    if(authorization && authorization.startsWith('Bearer')){
        try {
            //get token from header
            token= authorization.split(' ')[1];

            //verify token
            const {userId}= jwt.verify(token, process.env.JWT_SECRET_KEY);
            // console.log("user id", userId);
            req.user= await UserModel.findById(userId).select('-password');
            next();
        } catch (error) {
            console.log(error);
            res.status(401).send({"status":"failed", "message":"Unauthorized user"});
        }
    }
    if(!token){
        res.status(401).send({"status":"failed", "message":"Unauthorized user, no token"});
    }
}
module.exports= checkUserAuth;
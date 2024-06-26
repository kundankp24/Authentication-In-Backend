const UserModel= require("../models/User");
const bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const checkUserAuth= require("../middlewares/auth-middileware");
const transporter= require('../config/emailConfig');

class UserController {
    static userRegisteration= async (req, res)=>{
        const {name, email, password, password_confirmation, tc}= req.body;
        const user= await UserModel.findOne({email:email});
        if(user){
            res.send({"status":"Failed", "message":"email already exit"});
        }
        else{
            if(name && email && password && password_confirmation && tc){
                if(password===password_confirmation){
                    try 
                    {
                        const salt= await bcrypt.genSalt(10);
                        const hashPassword= await bcrypt.hash(password, salt);
                        const doc= new UserModel({
                            name:name,
                            email:email,
                            password:hashPassword,
                            tc:tc
                        })
                        await doc.save();
                        const saved_user= await UserModel.findOne({email: email});

                        //Generate JWT token
                        const token= jwt.sign({userId: saved_user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '5d'});
                        res.status(201).send({"status":"Success", "message":"Registration Successfully", "token":token});
                    } 
                    catch (error)
                    {
                        console.log(error);
                        res.send({"status":"Failed", "message":"Unable to Register"});
                    }
                }
                else{
                    res.send({"status":"Failed", "message":"Password and Confirm Password doesn't match"});
                }
            }
            else{
                res.send({"status":"Failed", "message":"All Field are required"});
            }
        }
    }
    // login function
    static userLogin=async (req, res)=>{
        try {
            const {email, password}= req.body;
            // var user=await  UserModel.findOne({'email':email}).select('+password').exec()
            if(email && password){
                const user= await UserModel.findOne({email:email});
                if(user != null){
                    const isMatch= await bcrypt.compare(password, user.password);
                    if((user.email===email) && isMatch){

                        //Generate JWT token
                        const token= jwt.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {expiresIn: '5d'});
                        res.send({"status":"Success", "message":"Login Success", "token":token});
                    }
                    else{
                        res.send({"status":"Failed", "message":"Invalid Credentials"});
                    }
                }
                else{
                    res.send({"status":"Failed", "message":"You are not register user"});
                }
            }
            else{
                res.send({"status":"Failed", "message":"All Field are required"});
            }
        } catch (error) {
            console.log(error);
            res.send({"status":"Failed", "message":"Unable to Login"});
        }
    }

    static changePasword=async (req, res)=>{
        const {password, password_confirmation}= req.body;
        if(password && password_confirmation){
            if(password!==password_confirmation){
                res.send({"status":"Failed","message":"Passwords do not Match"});
            }
            else{
                const salt= await bcrypt.genSalt(10);
                const newHashPassword= await bcrypt.hash(password, salt);
                // console.log(req.user);
                await UserModel.findByIdAndUpdate(req.user._id, {$set:{password: newHashPassword}});
                res.send({"status":"Success", "message":"Password Changed Successfully"});
            }
        }
        else{
            res.send({"status":"Failed", "message":"All Field are required"});
        }
    }
    static loggedUser=async (req, res)=>{
        res.send({"user": req.user});
    }
    static sendUserPasswordResetEmail=async(req, res)=>{
        const {email}= req.body;
        if(email){
            const user= await UserModel.findOne({email:email});
            if(user){
                const secret= user._id + process.env.JWT_SECRET_KEY;
                const token= jwt.sign({userId: user._id}, secret, {expiresIn: '15m'});
                const link=`http://127.0.0.1:3000/api/user/reset/${user._id}/${token}`;
                console.log(link);

                //Send the mail
                let info= await transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: user.email,
                    subject:"Password Reset Link",
                    // text:`Please click on the following link ${link}`,
                    html: `<a href=${link}">Click here to </a> to reset the password`
                });
                
                res.send({"status":"Success", "message":"Password Reset Email Sent...Please Check Your Email", "info":info});
            }else{
                res.send({"status":"Failed", "message":"Email does not exist"});
            }
        }else{
            res.send({"status":"Failed", "message":"Email Field are required"});
        }
    }
    static userPasswordReset=async (req, res)=>{
        const {password, password_confirmation}= req.body;
        const {id, token}= req.params;
        const user= await UserModel.findById(id);
        const new_secret= user._id + process.env.JWT_SECRET_KEY;
        try {
            jwt.verify(token, new_secret);

            if(password && password_confirmation){
                if(password===password_confirmation){
                    const salt= await bcrypt.genSalt(10);
                    const newHashPassword= await bcrypt.hash(password, salt);
                    await UserModel.findByIdAndUpdate(user._id, {$set:{password: newHashPassword}});
                    res.send({"status":"Success", "message":"Password Reset Successfully"});
                }
                else{
                    res.send({"status":"Failed","message":"New passwords and confirm new passowrd are different"});
                }
            }
            else{
                res.send({"status":"Failed","message":"All field are required"});
            }
        } catch (error) {
            console.log(error);
            res.send({"status":"Failed", "message":"Invalid Token"});
        }

    }
}
module.exports= UserController;
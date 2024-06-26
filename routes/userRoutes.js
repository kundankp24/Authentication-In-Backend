const express= require("express");
const router = express.Router();
const UserController=require("../controllers/userController");
const checkUserAuth= require("../middlewares/auth-middileware");

//Routes level Middileware
router.use("/changepassword", checkUserAuth);
router.use("/loggeduser", checkUserAuth);

//Public Routes
router.post("/register", UserController.userRegisteration);
router.post("/login", UserController.userLogin);
router.post("/send-reset-password-mail", UserController.sendUserPasswordResetEmail);
router.post("/reset-password/:id/:token", UserController.userPasswordReset);

//Protected Routes
router.post("/changepassword", UserController.changePasword);
router.get("/loggeduser", UserController.loggedUser);

module.exports=router;
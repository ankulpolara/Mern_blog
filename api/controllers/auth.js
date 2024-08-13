// controllers/auth.js

const { hash } = require('bcrypt');
const User = require('../model/User'); // Adjust the path based on your project structure
const bcryptjs = require('bcryptjs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const secureRandomPassword = require("secure-random-password");
const { use } = require('bcrypt/promises');
const { default: mongoose } = require('mongoose');



// Function to handle user registration
exports.registerUser = async (req, res) => {
    const { userName, email, password } = req.body;
    // console.log(req.body);

    try {
        const hashPassword = await bcryptjs.hash(password, 10);
        let isExist = await User.findOne({ userName: userName, email: email });

        if (isExist) {
            return res.status(300).json({
                success: false,
                message: 'Username and Email already exists. Please select another username and EMail.',
            });
        }

        const user = await User.create({ userName, email, password: hashPassword });
        if (!user) {
            return res.status(500).json({
                success: false,
                error,
                message: 'Error while user',
            });
        }
        console.log(user);
        return res.status(201).json({
            success: true,
            user,
            message: 'User created successfully',
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            error,
            message: 'Error while creating user',
        });
    }
};





// sign in 

exports.signIn = async (req, res) => {
    const { email, password } = req.body;


    // Check if both email and password are provided
    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide both email and password',
        });
    }

    try {
        // Find the user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Email user is not found',
            });
        }

        // Compare the provided password with the hashed password in the database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password',
            });
        }

       if(!user.ImageURL){
        user.ImageURL = `https://ui-avatars.com/api/?name=${user?.userName}&size=128&background=random&color=fff`
        await user.save();
       }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET, // Replace with your JWT secret
            { expiresIn: '28d' } // Set the token expiration time to 10 seconds
        );

        // Send the token in the response as a cookie
        res.cookie('token', token, {
            httpOnly: true, // Prevents JavaScript from accessing the cookie
            secure: process.env.NODE_ENV === 'production', // Set to true if using HTTPS
            sameSite: 'Strict', // Helps prevent CSRF attacks
            maxAge: 2592000000,
        });

        // Send success response
        res.status(200).json({
            success: true,
            token, // Optionally include the token in the response body
            user,
            message: 'Sign in successful',
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};











// with Google 


exports.signInWithGoogle = async (req, res) => {
    const { email, userName } = req.body;

    if (!email || !userName) {
        return res.status(400).json({
            success: false,
            message: 'Please provide both email and userName',
        });
    }

    try {
        // Find the user by email
        let user = await User.findOne({ email });

        // If the user does not exist, create a new user
        if (!user) {
            const password = secureRandomPassword.randomPassword({ length: 16 });
            const hashPassword = await bcrypt.hash(password, 10);
            user = await User.create({ userName, email, password: hashPassword });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '120h' }
        );

        // Send the token in the response as a cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Strict',
            maxAge: 3600000,
        });

        // Send success response
        res.status(200).json({
            success: true,
            token,
            user,
            message: 'Sign in successful',
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: 'Server error',
        });
    }
};




// UPDAATE USER PROFILE 

exports.updateUserProfile = async (req, res) => {
    const { userName, email, password,   ImageURL } = req.body;
    console.log(ImageURL);
    
    const userId = req.user.id; // Assuming you have user ID in req.user after authentication

   console.log("req.user...." , req.user);
   
    try {

        // Find the user by ID
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }


        // if value are come with old value then return  
        if (user?.userName == userName && user?.email == email) {
            const isMatch = await bcrypt.compare(password, user.password);
            if (isMatch && !  ImageURL) {
                return res.status(303).json({
                    success: false,
                    message: 'there are no changes..... this is youor old credential..',
                });
            }

        }




        // Check if userName already exists
        const userNameExists = await User.findOne({ userName });
        if (userNameExists && userNameExists._id.toString() !== userId) {
            return res.status(400).json({
                success: false,
                message: 'User name already exists',
            });
        }

        // Check if email already exists
        const emailExists = await User.findOne({ email });
        if (emailExists && emailExists._id.toString() !== userId) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists choose different',
            });
        }



        // Update user details
        if (userName) user.userName = userName;
        if (email) user.email = email;
        if (password) user.password = await bcrypt.hash(password, 10);
        if (ImageURL) user.ImageURL =   ImageURL;

        let updatedUser = await user.save();
 console.log("updated user..",updatedUser);
 
        res.status(200).json({
            success: true,
            message: 'User profile updated successfully',
            user: updatedUser
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false, 
            message: 'Server error',
        });
    }
};




//DELETE USER 


exports.deleteUser = async (req, res) => {

    console.log(" from middleware", req.user.id);
    console.log(" from params", req.params.id);
    let id = new mongoose.Types.ObjectId(req.user.id)
    console.log("object id converted ..", id);

    try {



        let user = await User.findByIdAndDelete(id)
        if (user) {
            console.log("user deleted..........");
            return res.status(200).json({
                success: true,
                message: 'User deleted...',
                user 
              
            });

        }
     

        if(!user){
            return res.status(200).json({
                success: false,
                message: 'User already deleted deleted...',
             
            });
        }
        // const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        // console.log("decodedd", decoded);

        // req.user = await User.findById(decoded.userId).select('-password');
        // if (!req.user) {
        //     return res.status(401).json({
        //         success: false,
        //         message: 'Invalid token./......',
        //     });
        // }


    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Invalid token.',
            error
        });
    }
};




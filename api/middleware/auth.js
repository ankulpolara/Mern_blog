const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = require('../model/User'); // Adjust the path to your User model

exports.authenticateToken = async (req, res, next) => {
    const token = req?.cookies?.token || req?.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access denied. No token provided.',
        });
    }

    try {
        console.log("Start decoding...");

        const decoded = await jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded);

        // Check if decoded userId is a valid MongoDB ObjectId
        if (!mongoose.Types.ObjectId.isValid(decoded.userId)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid token. User ID is not valid.',
            });
        }

        req.user = await User.findById(decoded.userId).select('-password');
        // console.log("User found:", req.user);

        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. User not found.',
            });
        }

        next();
    } catch (error) {
        console.error("Token verification error:", error);
        res.status(400).json({
            success: false,
            message: `${error}  token Exxpired ! Invalid token.`,
            error
        });
    }
};

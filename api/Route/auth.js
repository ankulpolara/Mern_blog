const express = require('express');
const { signIn, registerUser, signInWithGoogle, updateUserProfile, deleteUser } = require('../controllers/auth');
const { authenticateToken } = require('../middleware/auth');
const fileUpload = require('express-fileupload');
const { ImageUpload } = require('../controllers/ImageUpload');
const { imageUploadMidd } = require('../middleware/imageUploadMiddle');
const { getUserByUserName } = require('../controllers/User');

const router = express.Router();

// Middleware to handle file uploads
router.use(fileUpload({
  limits: { fileSize: 2 * 1024 * 1024 }, // Limit file size to 2MB
}));
// getting by username 
router.get('/users/:id', getUserByUserName);

router.post('/signup', registerUser);
router.post('/signin', signIn);
router.post('/google-sign-in', signInWithGoogle);
router.post('/update-user', authenticateToken, updateUserProfile);
router.delete('/delete-user/:id', authenticateToken, deleteUser);
router.post('/image-upload', authenticateToken, imageUploadMidd, ImageUpload);

module.exports = router;

const { log } = require("console");
const User = require("../model/User");

const ImageUpload = async (req, res) => {
  const { imageUrl } = req; // Assuming the middleware sets req.imageUrl
  const { email } = req.user;


  if (!imageUrl) {
    return res.status(400).send('No image URL found.');
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      { email },
      { ImageURL: imageUrl },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: 'User not found or error while updating profile',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Image URL updated successfully',
      user: updatedUser
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'An error occurred while updating the profile',
    });
  }
};

module.exports = { ImageUpload };





// blog image  upload  function 



// const BlogImageUpload = (req, res) => {
  // console.log("BlogImageUpload function called");
  // console.log(req?.files); // Log to check files object

  // const image = req.files ? req?.files?.image : null;
  // console.log(image);
  // if (!image) {
  //   return res.status(400).send('No image file uploaded.');
  // }

  // res.status(200).json({
  //   success: true,
  //   message: 'File received',
  //   image
  // });
// };

// module.exports  =BlogImageUpload ;
const cloudinary = require('cloudinary').v2;

const uploadImageToCloudinary = async (file, folder) => {
  const options = { folder, resource_type: 'auto' };

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    }).end(file.data);
  });
};

exports.imageUploadMidd = async (req, res, next) => {
  // console.log(req.files); // Log to check files object


  const image = req.files ? req.files.image : null;
  console.log(image);
  if (!image) {
    return res.status(400).send('No image file uploaded.');
  }

  try {
    const response = await uploadImageToCloudinary(image, 'mern-blog');
    console.log(response);
    console.log("imageUrl come ..." , response. secure_url);
    
    req.imageUrl = response. secure_url; // Store the image URL in request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    console.log('Error uploading image:', error);
    res.status(500).send('Error uploading image.');
  }
};

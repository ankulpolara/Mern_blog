

const cloudinary = require("cloudinary").v2; //! Cloudinary is being required

exports.cloudinaryConnect = () => {
  console.log("cloudinary config called...");
  
  try {
    cloudinary.config({
      //!    ########   Configuring the Cloudinary to Upload MEDIA ########
      cloud_name: process.env.CLOUD_NAME || 'dqd3xw8b2',
      api_key: process.env.API_KEY || '421312527597818',
      api_secret: process.env.API_SECRET || 'bTfyy7J8MNPJXLcfJiYfp-CfSV8',
    });
  } catch (error) {
    console.log(error);
  }
};
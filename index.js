const express = require('express');
const mongoose = require('mongoose');
const cloudinary = require('cloudinary').v2;
const { config: configDotenv } = require('dotenv');

const authRoute = require('./api/Route/auth.js');
const postRoute = require("./api/Route/Post.js");
// const authRoute = require(".")
const cors = require('cors');
const fileUpload = require('express-fileupload');

// const { cloudinaryConnect } = require('./config/CloudinaryConfig.js');
const { cloudinaryConnect } = require('./api/config/CloudinaryConfig.js');
configDotenv(); // Load environment variables from .env file

const app = express();
const port = process.env.PORT || 3002;

const moment = require('moment-timezone');

// Set default time zone to IST
moment.tz.setDefault('Asia/Kolkata');



// Middleware to parse JSON bodies
app.use(express.json());

// CORS configuration
// const corsOptions = {
//   origin:' http://localhost:3000'  , // Replace with the frontend's URL
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   credentials: true,
//   optionsSuccessStatus: 204
// };

// app.use(cors(corsOptions));
cloudinaryConnect();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});



// Define routes
// app.use('/api/', userRoute);
app.use('/api/', authRoute);
app.use('/api/', postRoute);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connection is successful'))
  .catch((e) => console.error(`Error while connecting: ${e}`));

// Basic route to handle GET requests
app.get('/', (req, res) => {
  res.send('Hello World from server!');
});
app.get('/demo', (req, res) => {
  res.send('demo is working good ......');
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

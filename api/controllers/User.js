
const { default: mongoose } = require('mongoose');
const User = require('../model/User'); // Adjust the path as needed

exports.getUserByUserName = async (req, res) => {
  const { id } = req.params;

  try {
    // Find user by userName

    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' , error });
  }
};

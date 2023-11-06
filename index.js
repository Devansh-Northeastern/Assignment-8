const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/Assignment-8', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const User = mongoose.model('User', {
  fullName: String,
  email: String,
  password: String,
});

app.post('/user/create', async (req, res) => {
  const { fullName, email, password } = req.body;
  console.log(fullName, email, password, req.body);

  if (!isValidEmail(email) || !isStrongPassword(password) || !isFullNameValid(fullName)) {
    return res.status(400).json({ message: 'Invalid email, password, or full name' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({ fullName, email, password: hashedPassword });

  try {
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    console.error('Error creating user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/user/edit', async (req, res) => {
  const { email, fullName, password } = req.body;

  if (!isStrongPassword(password) || !isFullNameValid(fullName)) {
    return res.status(400).json({ message: 'Invalid password or full name' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.fullName = fullName;
    user.password = hashedPassword;
    await user.save();
    res.json({ message: 'User details updated successfully' });
  } catch (err) {
    console.error('Error updating user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.delete('/user/delete', async (req, res) => {
  const email = req.body.email;

  try {
    const result = await User.deleteOne({ email });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    console.error('Error deleting user:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/user/getAll', async (req, res) => {
  try {
    const users = await User.find({}, 'fullName email password');
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

function isValidEmail(email) {
    const regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
    var output = regex.test(email);
    console.log(email,output);
    return output;
}

function isStrongPassword(password) {
    // Example: Minimum length of 8 characters, with at least one uppercase letter,
    // one lowercase letter, one number, and one special character.
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    var output = regex.test(password);
    console.log(password,output);
    return output;
}

function isFullNameValid(fullName) {
    if (fullName.length < 2 && fullName.length > 50) {
        return false;
      }
    
    const regex = /^[A-Za-z\s'-]+$/;    
    var output = regex.test(fullName);
    console.log(fullName, output);
    return output;
}

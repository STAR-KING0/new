const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Initialize app and server
const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB setup
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// MongoDB Models
const User = mongoose.model('User', new mongoose.Schema({
  username: { type: String, required: true, unique: true },
}));

const Message = mongoose.model('Message', new mongoose.Schema({
  user: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
}));

// Serve static files (e.g., HTML, CSS, JS files)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to handle JSON data
app.use(express.json());

// Handle the login route (check if username is unique)
app.post('/login', async (req, res) => {
  const { username } = req.body;

  try {
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ error: 'Username is already taken.' });
    }

    const newUser = new User({ username });
    await newUser.save();
    res.status(200).json({ message: 'Login successful' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Handle real-time communication via Socket.io
io.on('connection', (socket) => {
  let username = '';

  socket.on('setUsername', (name) => {
    username = name;
    io.emit('userJoined', `${username} has joined the chat.`);
  });

  socket.on('chatMessage', async (message) => {
    // Save the message to MongoDB
    const newMessage = new Message({ user: username, message });
    await newMessage.save();

    // Broadcast the message to all connected clients
    io.emit('chatMessage', { user: username, message });
  });

  socket.on('disconnect', async () => {
    if (username) {
      io.emit('userLeft', `${username} has left the chat.`);
      username = '';
    }
  });
});

// Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
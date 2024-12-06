// Connect to the Socket.io server
const socket = io();

// Get references to DOM elements
const messageInput = document.getElementById('message');
const sendMessageButton = document.getElementById('send-message');
const chatBox = document.getElementById('chat-box');
const userNickname = document.getElementById('user-nickname');

// Get the username from localStorage (set during login)
const username = window.localStorage.getItem('username');

// If no username is found, redirect to login
if (!username) {
  window.location.href = 'login.html'; // Redirect to login page
} else {
  // Set the username in the chat page header
  userNickname.textContent = username;

  // Notify the server about the user's nickname
  socket.emit('setUsername', username);
}

// Handle sending messages
sendMessageButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', function (event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
});

function sendMessage() {
  const message = messageInput.value.trim();
  if (message) {
    // Emit the message to the server
    socket.emit('chatMessage', message);

    // Clear the input field
    messageInput.value = '';
  }
}

// Listen for incoming chat messages
socket.on('chatMessage', (data) => {
  const messageDiv = document.createElement('div');
  messageDiv.className = 'chat-message';
  messageDiv.textContent = `${data.user}: ${data.message}`;
  chatBox.appendChild(messageDiv);

  // Auto-scroll to the bottom of the chat box
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Listen for notifications about user joins
socket.on('userJoined', (message) => {
  const notificationDiv = document.createElement('div');
  notificationDiv.className = 'chat-notification';
  notificationDiv.textContent = message;
  chatBox.appendChild(notificationDiv);

  // Auto-scroll to the bottom
  chatBox.scrollTop = chatBox.scrollHeight;
});

// Listen for notifications about user leaves
socket.on('userLeft', (message) => {
  const notificationDiv = document.createElement('div');
  notificationDiv.className = 'chat-notification';
  notificationDiv.textContent = message;
  chatBox.appendChild(notificationDiv);

  // Auto-scroll to the bottom
  chatBox.scrollTop = chatBox.scrollHeight;
});
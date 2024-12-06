// Get references to DOM elements
const loginForm = document.getElementById('login-form');
const usernameInput = document.getElementById('username');
const errorMessage = document.getElementById('error-message');
const messageInput = document.getElementById('message');
const chatBox = document.getElementById('chat-box');
const sendMessageButton = document.getElementById('send-message');

// Set up Socket.io
const socket = io();

// Handle login form submission
loginForm.addEventListener('submit', function (event) {
  event.preventDefault();
  const username = usernameInput.value.trim();

  // Send POST request to the server to check if the username is available
  fetch('/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username }),
  })
    .then((response) => {
      if (response.ok) {
        window.localStorage.setItem('username', username);
        window.location.href = 'chat.html'; // Redirect to chat page
      } else {
        return response.json();
      }
    })
    .then((data) => {
      if (data && data.error) {
        errorMessage.textContent = data.error;
      }
    })
    .catch((error) => {
      console.error('Error:', error);
    });
});

// Display the user's nickname on the chat page
if (window.location.pathname.endsWith('chat.html')) {
  const username = window.localStorage.getItem('username');
  document.getElementById('user-nickname').textContent = username;
  
  socket.emit('setUsername', username); // Send the username to the server

  sendMessageButton.addEventListener('click', function () {
    const message = messageInput.value.trim();
    if (message) {
      socket.emit('chatMessage', message);
      messageInput.value = ''; // Clear input field
    }
  });

  // Listen for incoming messages and display them
  socket.on('chatMessage', (data) => {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = `${data.user}: ${data.message}`;
    chatBox.appendChild(messageDiv);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto scroll to the bottom
  });

  // Listen for user join/leave events
  socket.on('userJoined', (message) => {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
  });

  socket.on('userLeft', (message) => {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    chatBox.appendChild(messageDiv);
  });
}
const socket = io();
const statusEl = document.getElementById('status');
const chatBox = document.getElementById('chatBox');
const messageForm = document.getElementById('messageForm');
const messageInput = document.getElementById('messageInput');

function addLine(text, className = '') {
  const div = document.createElement('div');
  div.className = `line ${className}`.trim();
  div.textContent = text;
  chatBox.appendChild(div);
  chatBox.scrollTop = chatBox.scrollHeight;
}

socket.on('status', (message) => {
  statusEl.textContent = message;
  addLine(message, 'status');
});

socket.on('matched', () => {
  addLine('Matched with a stranger!', 'status');
});

socket.on('message', (message) => {
  addLine(`Stranger: ${message}`, 'stranger');
});

messageForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const text = messageInput.value.trim();
  if (!text) return;
  addLine(`You: ${text}`, 'you');
  socket.emit('message', text);
  messageInput.value = '';
  messageInput.focus();
});

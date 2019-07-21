import './css/style.css';

// globals
const webSocket = new WebSocket(URL_DEV);
let logged = false;

// DOM manipulations
function addMessage(username, message) {
  const messages = document.getElementById('messages');
  const li = document.createElement('li');
  li.innerHTML = `${username}: ${message}`;
  messages.appendChild(li);
}
function renderUsers(array) {
  const users = document.getElementById('users');
  users.innerHTML = '';
  array.forEach(user => {
    const li = document.createElement('li');
    li.innerHTML = user.name;
    users.appendChild(li);
  });
}
function setStatus(value) {
  const status = document.getElementById('status');
  status.innerHTML = value;
}
function hideElement(element) {
  element.classList.add('hidden');
}
function setPlaceholder(element, text) {
  element.placeholder = text;
}

// app event listeners
const form = document.getElementById('form');
form.addEventListener('submit', e => {
  e.preventDefault();
  const text = document.getElementById('input').value.trim();
  let data = {
    type: 'message',
    payload: text
  };
  if (text === 'exit') {
    data.type = 'exit';
  } else if (!logged) {
    if (text.length < 3) {
      alert('Invalid username!');
      return;
    }
    logged = true;
    hideElement(document.getElementById('guest'));
    setPlaceholder(document.getElementById('input'), 'Type your message');
    data.type = 'name';
  }
  webSocket.send(JSON.stringify(data));
  input.value = '';
})

// websocket event listeners
webSocket.onopen = () => setStatus('ONLINE');
webSocket.onclose = () => setStatus('OFFLINE');
webSocket.onmessage = res => {
  let data = JSON.parse(res.data);
  switch (data.type) {
    case 'clients' : {
      let clients = data.payload;
      renderUsers(clients);
      break;
    }
    case 'message' : {
      const { name, message } = data.payload;
      addMessage(name, message);
      break;
    }
  }
};

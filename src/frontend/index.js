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
function setNickname(value) {
  const nickname = document.getElementById('nickname');
  nickname.innerHTML = value;
}
function renderUserList(array) {
  const users = document.getElementById('users');
  users.innerHTML = '';
  array = array.slice(0).sort((a, b) => {
    a = a.name.toLowerCase();
    b = b.name.toLowerCase();
    return a < b ? -1 : a > b ? 1 : 0; 
  });
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
function setPlaceholder(element, text) {
  element.placeholder = text;
}

// app logic

function validateNickname(name) {
  return !(name.length < 3 || name.match(/Guest/i));
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
    if (!validateNickname(text)) {
      alert('Invalid username!');
      return;
    }
    data.type = 'name';
  }
  webSocket.send(JSON.stringify(data));
  input.value = '';
});

// websocket event listeners
webSocket.onopen = () => setStatus('ONLINE');
webSocket.onclose = () => setStatus('OFFLINE');
webSocket.onmessage = res => {
  let data = JSON.parse(res.data);
  switch (data.type) {
    case 'clients' : {
      let { users } = data.payload;
      renderUserList(users);
      break;
    }
    case 'default-user' : {
      let { currentUser } = data.payload;
      setNickname(currentUser.name);
      break;
    }
    case 'user' : {
      let { currentUser } = data.payload;
      let textField = document.getElementById('input');
      logged = true;
      setNickname(currentUser.name);
      setPlaceholder(textField, 'Type your message');
      break;
    }
    case 'message' : {
      const { currentUser, message } = data.payload;
      addMessage(currentUser.name, message);
      break;
    }
  }
};

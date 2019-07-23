import './css/style.css';

// globals
const webSocket = new WebSocket(URL);
let logged = false;

// DOM manipulations
function addMessage(username, message, timestamp) {
  const messages = document.getElementById('messages');
  setChatHeight(messages.clientHeight);
  const li = document.createElement('li');
  li.classList.add('chat__message');
  const date = parseTimestamp(timestamp);
  let { hours, minutes, seconds } = date;
  if (hours < 10) hours = '0' + hours;
  if (minutes < 10) minutes = '0' + minutes;
  if (seconds < 10) seconds = '0' + seconds;
  const time = `${hours}:${minutes}:${seconds}`;
  li.innerHTML = `
    <span class="chat__timestamp">[${time}]</span>
    <span class="chat__username">${username}:</span> 
    <span class="chat__text">${message}</span>
  `;
  messages.appendChild(li);
  scrollDown(messages);
}
function scrollDown(element) {
  element.scrollTop = element.scrollHeight;
}
function setChatHeight(value) {
  const chat = document.querySelector('.chat__wrapper');
  chat.style.height = value + 'px';
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
    li.classList.add('chat__user');
    li.innerHTML = user.name;
    users.appendChild(li);
  });
}
function setStatus(value) {
  const status = document.getElementById('status');
  if (value) {
    status.classList.remove('content__status-value--offline');
    status.classList.add('content__status-value--online');
    status.innerHTML = 'ONLINE';
  } else {
    status.classList.remove('content__status-value--online');
    status.classList.add('content__status-value--offline');
    status.innerHTML = 'OFFLINE';
  }
}
function setPlaceholder(element, text) {
  element.placeholder = text;
}

// app logic

function validateNickname(name) {
  return !(name.length < 3 || name.length > 10 || name.match(/Guest/i));
}
function parseTimestamp(timestamp) {
  let date = new Date(timestamp);
  return {
    hours: date.getHours(),
    minutes: date.getMinutes(),
    seconds: date.getSeconds()
  };
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
  data.timestamp = Date.now();
  webSocket.send(JSON.stringify(data));
  input.value = '';
});

// websocket event listeners
webSocket.onopen = () => setStatus(true);
webSocket.onclose = () => setStatus(false);
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
      const { currentUser, message, timestamp } = data.payload;
      addMessage(currentUser.name, message, timestamp);
      break;
    }
  }
};

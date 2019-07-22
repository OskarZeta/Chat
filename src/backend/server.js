const express = require('express');
const server = express();
const expressWs = require('express-ws')(server);
const uuid = require('uuid');

let connections = {};
let counter = 0;
let users = [];

function findUserIndex(id, usersArray) {
  return usersArray.findIndex(user => user.id === id);
}
function findUser(id, usersArray) {
  return usersArray.find(user => user.id === id);
}
function sendDataToAll(type, payload) {
  const clients = expressWs.getWss().clients;
  clients.forEach(client => {
    client.send(JSON.stringify({ type, payload }));
  });
}
function sendDataToClient(type, payload, client) {
  client.send(JSON.stringify({ type, payload }));
}

server.ws('/', (ws, req) => {
  counter++;
  const id = uuid.v4();
  const defaultName = `Guest_${counter}`;
  connections[id] = ws;

  users.push({ id, name: defaultName });
  const currentUser = findUser(id, users);
  sendDataToAll('clients', { users });
  sendDataToClient('default-user', { currentUser }, ws);

  ws.on('message', msg => {
    msg = JSON.parse(msg);
    switch (msg.type) {
      case 'exit' : {
        ws.close();
        break;
      }
      case 'name' : {
        currentUser.name = msg.payload;
        sendDataToAll('clients', { users });
        sendDataToClient('user', { currentUser }, ws);
        break;
      }
      case 'message' : {
        let message = msg.payload;
        let timestamp = msg.timestamp;
        sendDataToAll('message', { currentUser, message, timestamp });
        break;
      }
    }
  });
  ws.on('close', req => {
    delete connections[id];
    users.splice(findUserIndex(id, users), 1);
    sendDataToAll('clients', { users });
  });
});

server.listen(4000);
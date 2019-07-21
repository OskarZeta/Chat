const express = require('express');
const server = express();
const expressWs = require('express-ws')(server);
//const path = require('path');
const uuid = require('uuid');

let connections = {};
let counter = 0;
let users = [];

server.ws('/', (ws, req) => {
  counter++;
  const id = uuid.v4();
  const clients = expressWs.getWss().clients;
  const defaultName = `Guest_${counter}`;
  connections[id] = ws;

  function findUserIndex(id) {
    return users.findIndex(user => user.id === id);
  }
  function sendData(type, payload) {
    clients.forEach(client => {
      client.send(JSON.stringify({ type, payload }));
    });
  }

  users.push({ id, name: defaultName });
  sendData('clients', users);

  ws.on('message', msg => {
    msg = JSON.parse(msg);
    switch (msg.type) {
      case 'exit' : {
        ws.close();
        break;
      }
      case 'name' : {
        users[findUserIndex(id)].name = msg.payload;
        sendData('clients', users);
        break;
      }
      case 'message' : {
        sendData('message', { name: users[findUserIndex(id)].name, message: msg.payload });
        break;
      }
    }
  });

  ws.on('close', req => {
    delete connections[id];
    users.splice(findUserIndex(id), 1);
    sendData('clients', users);
  });
});

server.listen(4000);
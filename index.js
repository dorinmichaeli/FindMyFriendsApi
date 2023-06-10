import {nanoid} from 'nanoid';
import {WebSocketServer, WebSocket} from 'ws';

const MESSAGE_TYPE = {
  USER_JOINED: 'A',
  CHAT_MESSAGE: 'B',
  USER_LEFT: 'C',
  CHAT_HISTORY: 'D',
};

class ChatHistory {
  constructor({messageLimit}) {
    this._messages = [];
    this._messageLimit = messageLimit;
  }

  addMessage(message) {
    // Add message to the array.
    this._messages.push(message);
    // Make sure array doesn't exceed the message limit.
    if (this._messages.length > this._messageLimit) {
      this._messages.shift();
    }
  }

  getMessages() {
    // Return a defensive copy of the array.
    return this._messages.slice();
  }
}

main();

function main() {
  const messageHistory = new ChatHistory({
    messageLimit: 100,
  });

  const server = new WebSocketServer({
    port: 8080,
  });

  server.on('listening', () => {
    console.log('WebSocket server listening for incoming connections on port 8080.');
  });

  server.on('connection', socket => {
    // Generate a unique ID for this client.
    socket.id = nanoid();
    // Send the chat history to the client.
    sendHistory(socket);
    // Let the clients know that a new client has joined.
    broadcastUserJoined(socket);

    socket.on('message', messageBuffer => {
      // Let the clients know that a new message has been received.
      broadcastChatMessage(socket, messageBuffer);
    });

    socket.on('error', err => {
      console.error('Error on client socket:', err);
    });

    socket.on('close', () => {
      // Let the clients know that a client has left.
      broadcastUserLeft(socket);
    });
  });

  function broadcastUserJoined(socket) {
    // Record the message's timestamp.
    const currentTime = new Date().toISOString();
    // Create a user joined message object.
    const userJoinedMessage = {
      timestamp: currentTime,
      userId: socket.id,
    };

    // Serialize the message.
    const messageData = serializeMessage(MESSAGE_TYPE.USER_JOINED, JSON.stringify(userJoinedMessage));
    // Send the message to all connected clients.
    broadcastMessage(server, messageData);
  }

  function broadcastChatMessage(socket, messageBuffer) {
    // Record the message's timestamp.
    const currentTime = new Date().toISOString();
    // Convert the message to a string.
    const messageText = messageBuffer.toString('utf-8');
    // Create a message object.
    const message = {
      senderId: socket.id,
      timestamp: currentTime,
      text: messageText,
    };
    // Add the message to the list of messages.
    messageHistory.addMessage(message);

    // Serialize the message.
    const messageData = serializeMessage(MESSAGE_TYPE.CHAT_MESSAGE, JSON.stringify(message));
    // Send the chat message to all connected clients.
    broadcastMessage(server, messageData);
  }

  function broadcastUserLeft(socket) {
    // Record the message's timestamp.
    const currentTime = new Date().toISOString();
    // Create a user left message object.
    const userLeftMessage = {
      timestamp: currentTime,
      userId: socket.id,
    };

    // Serialize the message.
    const messageData = serializeMessage(MESSAGE_TYPE.USER_LEFT, JSON.stringify(userLeftMessage));
    // Send the message to all connected clients.
    broadcastMessage(server, messageData);
  }

  function sendHistory(socket) {
    // Serialize the chat history.
    const messageData = serializeMessage(MESSAGE_TYPE.CHAT_HISTORY, JSON.stringify(messageHistory.getMessages()));
    // Send the chat history to the client.
    socket.send(messageData);
  }
}

function broadcastMessage(server, messageText) {
  for (const client of server.clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageText);
    }
  }
}

function serializeMessage(messageType, messageObject) {
  return messageType + JSON.stringify(messageObject);
}

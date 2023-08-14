import {WebSocketServer} from 'ws';
import {parseMessage} from './core/parse-message.js';
import {handleUserLeft} from './events/userLeft.event.js';
import {handleAddMarker} from './events/addMarker.event.js';
import {serializeMessage} from './core/serialize.js';
import {handleUserJoined} from './events/userJoined.event.js';
import {handleClientWelcome} from './events/clientWelcome.event.js';
import {handleAddChatMessage} from './events/addChatMessage.event.js';
import {validateInitialConnection} from './core/validate-connection.js';
import {CLIENT_MESSAGE_TYPE, SERVER_MESSAGE_TYPE} from './core/message-types.js';
import {handleDeleteMarker} from './events/deleteMarker.event.js';

export function initWsApi(port, {userAuthService, groupModel, chatMessageModel, markerModel}) {
  const wss = new WebSocketServer({
    port,
  });

  wss.on('listening', () => {
    console.log('WebSocket server listening for incoming connections on port 8080.');
  });

  wss.on('connection', async function (socket, incomingRequest) {
    try {
      await prepareNewConnection(socket, incomingRequest);
    } catch (error) {
      // Error during the initial preparation of the connection.
      // Send the error to the client and close the connection immediately.
      sendError(socket, error.message);
      socket.close();
      return;
    }

    socket.on('message', messageBuffer => {
      handleClientMessage(socket, messageBuffer).catch(error => {
        sendError(socket, error.message);
      });
    });

    socket.on('error', err => {
      console.error('Error on client socket:', err);
    });

    socket.on('close', () => {
      // Let the clients know that a client has left.
      handleUserLeft(socket, {wss});
    });
  });

  async function prepareNewConnection(socket, incomingRequest) {
    const {userInfo, groupInfo}
      = await validateInitialConnection(socket, incomingRequest, {userAuthService, groupModel});

    // Put the user info on the socket object.
    socket.userInfo = userInfo;
    // Put the group info on the socket object.
    socket.groupInfo = groupInfo;

    // Send a welcome message to the client with some info.
    await handleClientWelcome(socket, {wss, chatMessageModel, markerModel});
    // Let all the clients know that a new client has joined.
    await handleUserJoined(socket, {wss});
  }

  async function handleClientMessage(socket, messageBuffer) {
    // 1. Parse the message.
    const {messageType, data} = parseMessage(messageBuffer);

    // 2. Construct the request object.
    const req = {
      socket,
      data,
    };

    // 3. Handle the message.
    switch (messageType) {
      case CLIENT_MESSAGE_TYPE.ADD_CHAT_MESSAGE:
        await handleAddChatMessage(req, {wss, chatMessageModel});
        break;
      case CLIENT_MESSAGE_TYPE.ADD_MARKER:
        await handleAddMarker(req, {wss, markerModel});
        break;
      case CLIENT_MESSAGE_TYPE.DELETE_MARKER:
        await handleDeleteMarker(req, {wss, markerModel});
        break;
      default:
        throw new Error('Unknown message type: ' + messageType);
    }
  }
}

function sendError(socket, errorMessage) {
  const messageData = serializeMessage(SERVER_MESSAGE_TYPE.ERROR, errorMessage);
  socket.send(messageData);
}

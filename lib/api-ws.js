import { WebSocketServer } from 'ws';
import { CLIENT_MESSAGE_TYPE, SERVER_MESSAGE_TYPE } from './core/message-types.js';
import { serializeMessage } from './core/serialize.js';
import { broadcastMessageToGroup } from './core/broadcast.js';
import { sendHistoryToUser } from './core/history.js';
import { addChatMessage } from './controller/chatMessage.controller.js';
import { findGroupById } from './controller/group.controller.js';

export function initWsApi(port, { chatMessageModel, groupModel, userAuthService }) {
  const wss = new WebSocketServer({
    port,
  });

  wss.on('listening', () => {
    console.log('WebSocket server listening for incoming connections on port 8080.');
  });

  wss.on('connection', socket => {
    // Clients start out as unauthenticated.
    socket.authenticated = false;

    socket.on('message', messageBuffer => {
      const messageString = messageBuffer.toString('utf-8');
      const messageType = messageString[0];
      const messageText = messageString.slice(1);

      switch (messageType) {
        case CLIENT_MESSAGE_TYPE.AUTHENTICATION_REQUEST:
          // Client is attempting to authenticate.
          handleAuthenticationRequest(socket, messageText);
          break;
        case CLIENT_MESSAGE_TYPE.CHAT_MESSAGE:
          // Let the clients know that a new message has been received.
          handleChatMessage(socket, messageText);
          break;
        default:
          console.error('Unknown message type:', messageType);
          break;
      }
    });

    socket.on('error', err => {
      console.error('Error on client socket:', err);
    });

    socket.on('close', () => {
      if (!socket.authenticated) {
        return;
      }

      // Let the clients know that a client has left.
      handleUserLeft(socket);
    });
  });

  function handleUserAuthenticated(socket) {
    if (!socket.authenticated || !socket.userInfo) {
      console.error('handleUserAuthenticatedAndJoined() called on unauthenticated socket!');
      return;
    }

    // Record the message's timestamp.
    const currentTime = new Date().toISOString();
    // Create a user joined message object.
    const userJoinedMessage = {
      timestamp: currentTime,
      userName: socket.userInfo.email,
    };

    // Serialize the message.
    const messageData = serializeMessage(SERVER_MESSAGE_TYPE.USER_JOINED, userJoinedMessage);
    // Send the message to all members in group.
    broadcastMessageToGroup(wss, socket.groupId, messageData);

    // Send the chat history to the client.
    sendHistoryToUser({ chatMessageModel, socket });
  }

  async function handleAuthenticationRequest(socket, messageText) {
    const { authToken, groupId } = JSON.parse(messageText);

    // Authenticate the user.
    const userInfo = await userAuthService.verifyIdToken(authToken);
    if (!userInfo) {
      sendError(socket, 'Invalid auth token: ' + authToken);
      return;
    }

    // Get the group info.
    const groupInfo = await findGroupById(groupModel, groupId);
    // Make sure such a group exists.
    if (!groupInfo) {
      sendError(socket, 'Invalid group ID: ' + groupId);
      return;
    }

    socket.authenticated = true;
    socket.groupId = groupId;
    socket.userInfo = userInfo;
    // Notify the client that authentication was successful.
    const messageData = serializeMessage(SERVER_MESSAGE_TYPE.AUTHENTICATED, {
      // Let the user know the name of the group they've joined.
      groupId: groupInfo.groupId,
      groupName: groupInfo.groupName,
    });
    socket.send(messageData);

    // Let the clients know that a new client has joined.
    handleUserAuthenticated(socket);
  }

  async function authenticateMessage(socket, messageText) {
    // Split the message into an auth token and message text.
    const parts = messageText.split('::');
    if (parts.length !== 2) {
      sendError(socket, 'Invalid chat message format: ' + messageText);
      return null;
    }
    const [authToken, data] = parts;

    // Authenticate the user.
    const userInfo = await userAuthService.verifyIdToken(authToken);
    if (!userInfo) {
      sendError(socket, 'Invalid auth token: ' + authToken);
      return null;
    }

    return { userInfo, data };
  }

  async function handleChatMessage(socket, messageText) {
    // Record the message's timestamp.
    const currentTime = new Date().toISOString();
    // Authenticate the user.
    const { userInfo, data } = await authenticateMessage(socket, messageText);
    // Create a message object.
    const message = {
      userName: userInfo.email,
      timestamp: currentTime,
      text: data,
    };
    // Store the new message in the database.
    addChatMessage(chatMessageModel, message).catch(err => {
      console.error('Error while adding chat message to database:', err);
    });

    // Serialize the message.
    const outgoingMessage = serializeMessage(SERVER_MESSAGE_TYPE.CHAT_MESSAGE, message);
    // Send the chat message to all connected clients.
    broadcastMessageToGroup(wss, socket.groupId, outgoingMessage);
  }

  function handleUserLeft(socket) {
    // Record the message's timestamp.
    const currentTime = new Date().toISOString();
    // Create a user left message object.
    const userLeftMessage = {
      timestamp: currentTime,
      userName: socket.userInfo.email,
    };

    // Serialize the message.
    const messageData = serializeMessage(SERVER_MESSAGE_TYPE.USER_LEFT, userLeftMessage);
    // Send the message to all connected clients.
    broadcastMessageToGroup(wss, socket.groupId, messageData);
  }

  function sendError(socket, errorMessage) {
    const messageData = serializeMessage(SERVER_MESSAGE_TYPE.ERROR, errorMessage);
    socket.send(messageData);
  }
}

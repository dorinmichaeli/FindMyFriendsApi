import { addChatMessage } from '../../lib/controller/chatMessage.controller.js';
import { serializeMessage } from '../core/serialize.js';
import { SERVER_MESSAGE_TYPE } from '../core/message-types.js';
import { broadcastMessageToGroup } from '../core/broadcast.js';

export async function handleChatMessage(req, { chatMessageModel, wss }) {
  // Record the message's timestamp.
  const currentTime = new Date().toISOString();
  // Create a message object.
  const message = {
    userName: req.socket.userInfo.email,
    timestamp: currentTime,
    text: req.data,
  };
  // Store the new message in the database.
  addChatMessage(chatMessageModel, message).catch(err => {
    console.error('Error while adding chat message to database:', err);
  });

  // Serialize the message.
  const outgoingMessage = serializeMessage(SERVER_MESSAGE_TYPE.CHAT_MESSAGE, message);
  // Send the chat message to all connected clients.
  broadcastMessageToGroup(wss, req.socket.groupId, outgoingMessage);
}

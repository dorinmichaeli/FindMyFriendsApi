import { addChatMessage } from '../../shared/controller/chatMessage.controller.js';
import { serializeMessage } from '../core/serialize.js';
import { SERVER_MESSAGE_TYPE } from '../core/message-types.js';
import { broadcastMessageToGroup } from '../core/broadcast.js';

export async function handleAddChatMessage(req, { wss, chatMessageModel }) {
  // Record the message's timestamp.
  const currentTime = new Date().toISOString();
  // Create a message object.
  const message = {
    groupId: req.socket.groupInfo.groupId,
    userName: req.socket.userInfo.email,
    timestamp: currentTime,
    text: req.data,
  };
  // Store the new message in the database.
  addChatMessage(message, { chatMessageModel }).catch(err => {
    console.error('Error while adding chat message to database:', err);
  });

  // Serialize the message.
  const outgoingMessage = serializeMessage(SERVER_MESSAGE_TYPE.CHAT_MESSAGE, message);
  // Let the group know about the new message.
  broadcastMessageToGroup(wss, req.socket.groupInfo.groupId, outgoingMessage);
}

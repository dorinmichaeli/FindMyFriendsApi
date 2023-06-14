import { serializeMessage } from '../core/serialize.js';
import { SERVER_MESSAGE_TYPE } from '../core/message-types.js';
import { getChatMessageHistory } from '../../lib/controller/chatMessage.controller.js';

const HISTORY_MESSAGE_LIMIT = 5;

export async function handleClientWelcome(socket, { chatMessageModel }) {
  // Get the chat history.
  const chatHistory = await getChatMessageHistory(chatMessageModel, HISTORY_MESSAGE_LIMIT);

  // Create a welcome message object that lets the client get up to speed.
  const messageData = serializeMessage(SERVER_MESSAGE_TYPE.WELCOME, {
    // Let the user know the name of the group
    // they've joined, so they can display it.
    groupName: socket.groupInfo.groupName,
    // Send the user some messages that were send before they joined.
    chatHistory: chatHistory,
  });
  socket.send(messageData);
}


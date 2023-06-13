import { getChatMessageHistory } from '../controller/chatMessage.controller.js';
import { serializeMessage } from './serialize.js';
import { SERVER_MESSAGE_TYPE } from './message-types.js';

const HISTORY_MESSAGE_LIMIT = 5;

export async function sendHistoryToUser(socket, {chatMessageModel}) {
  // Load the chat history from the database.
  const messageHistory = await getChatMessageHistory(chatMessageModel, HISTORY_MESSAGE_LIMIT);
  // Serialize it.
  const messageData = serializeMessage(SERVER_MESSAGE_TYPE.CHAT_HISTORY, messageHistory);
  // Send it to the client.
  socket.send(messageData);
}

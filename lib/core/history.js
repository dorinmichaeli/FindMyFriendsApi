import { getChatMessageHistory } from '../controller/chatMessage.controller.js';
import { serializeMessage } from './serialize.js';
import { SERVER_MESSAGE_TYPE } from './message-types.js';

export async function sendHistoryToUser({chatMessageModel, socket}) {
  // Load the chat history from the database.
  const messageHistory = await getChatMessageHistory(chatMessageModel);
  // Serialize it.
  const messageData = serializeMessage(SERVER_MESSAGE_TYPE.CHAT_HISTORY, messageHistory);
  // Send it to the client.
  socket.send(messageData);
}

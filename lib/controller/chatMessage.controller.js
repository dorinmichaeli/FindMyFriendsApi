export async function addChatMessage(chatMessageModel, message) {
  await chatMessageModel
    .create(message);
}

export async function getChatMessageHistory(chatMessageModel, messageLimit) {
  return await chatMessageModel
    .find()
    .sort({timestamp: 1})
    .limit(messageLimit);
}

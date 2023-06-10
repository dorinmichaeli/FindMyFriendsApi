export async function addChatMessage(chatMessageModel, message) {
  await chatMessageModel
    .create(message);
}

export async function getChatMessageHistory(chatMessageModel) {
  return await chatMessageModel
    .find()
    .sort({timestamp: -1})
    .limit(100);
}

export async function addChatMessage(message, { chatMessageModel }) {
  await chatMessageModel
    .create(message);
}

export async function getChatMessageHistory(groupId, messageLimit, { chatMessageModel }) {
  return await chatMessageModel
    .find({ groupId })
    .sort({ timestamp: 1 })
    .limit(messageLimit);
}

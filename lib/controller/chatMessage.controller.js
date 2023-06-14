export async function addChatMessage(message, { chatMessageModel }) {
  await chatMessageModel
    .create(message);
}

export async function getChatMessageHistory(groupId, messageLimit, { chatMessageModel }) {
  const messageList = await chatMessageModel
    .find({ groupId })
    .sort({ timestamp: -1 })
    .limit(messageLimit);
  // Reverse the order of the messages so that the oldest message is first.
  return messageList.reverse();
}

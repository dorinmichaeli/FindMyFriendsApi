export function serializeMessage(messageType, messageObject) {
  let serialized = messageType;
  if (messageObject) {
    serialized += JSON.stringify(messageObject);
  }
  return serialized;
}

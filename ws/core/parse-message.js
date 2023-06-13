export function parseMessage(messageBuffer) {
  const messageString = messageBuffer.toString('utf-8');
  const messageType = messageString[0];
  const messageJson = messageString.slice(1);

  // Every message from the client is expected to be a JSON object with the same
  // structure: { authToken: string, data: any }.
  let message;
  try {
    message = JSON.parse(messageJson);
  } catch (err) {
    // Make the error friendlier to the client.
    throw new Error('Failed to parse message as JSON: ' + err.message);
  }
  return {
    messageType: messageType,
    data: message,
  };
}

export async function authenticateMessage(messageJson, {userAuthService}) {
  // Every message from the client is expected to be a JSON object with the same
  // structure: { authToken: string, data: any }.
  let message;
  try {
    message = JSON.parse(messageJson);
  } catch (err) {
    // Make the error friendlier to the client.
    throw new Error('Failed to parse message as JSON: ' + err.message);
  }
  const { authToken, data } = message;

  // Authenticate the user.
  const userInfo = await userAuthService.verifyIdToken(authToken);
  if (!userInfo) {
    throw new Error('Invalid auth token: ' + authToken);
  }

  return { userInfo, data };
}

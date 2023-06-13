export const SERVER_MESSAGE_TYPE = {
  // Message sent to all users in the group when a new user joins.
  USER_JOINED: 'A',
  CHAT_MESSAGE: 'B',
  USER_LEFT: 'C',
  CHAT_HISTORY: 'D',
  ERROR: 'E',
  // Message sent to the user after they have joined.
  WELCOME: 'F',
};

export const CLIENT_MESSAGE_TYPE = {
  CHAT_MESSAGE: 'y',
};

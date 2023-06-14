import {listAllMarkers} from '../../lib/controller/marker.controller.js';
import {serializeMessage} from '../core/serialize.js';
import {SERVER_MESSAGE_TYPE} from '../core/message-types.js';
import {getChatMessageHistory} from '../../lib/controller/chatMessage.controller.js';

const HISTORY_MESSAGE_LIMIT = 5;

export async function handleClientWelcome(socket, { wss, chatMessageModel, markerModel }) {
  const groupId = socket.groupInfo.groupId;

  // Get the users in this group.
  const usersInGroup = getUsersInGroup(groupId, { wss });

  const [chatHistory, markerList] = await Promise.all([
    // Get some of the latest messages from the chat history.
    getChatMessageHistory(groupId, HISTORY_MESSAGE_LIMIT, { chatMessageModel }),
    // Get the list of markers currently placed.
    listAllMarkers(groupId, { markerModel }),
  ]);

  markerList.forEach(marker => {
    // Map the "_id" field to "id".
    marker._doc.id = marker._id;
  });

  // Create a welcome message object that lets the client get up to speed.
  const messageData = serializeMessage(SERVER_MESSAGE_TYPE.WELCOME, {
    // Send the group id back to the user for convenience.
    groupId: groupId,
    // Let the user know the name of the group
    // they've joined, so they can display it.
    groupName: socket.groupInfo.groupName,
    // Send the user some messages that were send before they joined.
    chatHistory: chatHistory,
    // Send the user a list of markers that were created before they joined.
    markerList: markerList,
    // Send the user a list of current users in the group.
    usersInGroup: usersInGroup,
  });
  socket.send(messageData);
}

function getUsersInGroup(groupId, { wss }) {
  const users = [];
  for (const client of wss.clients) {
    if (client.groupInfo.groupId === groupId) {
      users.push(client.userInfo.email);
    }
  }
  return users;
}

import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  groupId: {type: String, required: true},
  userName: {type: String, required: true},
  timestamp: {type: Date, required: true},
  text: {type: String, required: true},
});

export function createChatMessageModel(client) {
  return client.model('ChatMessage', chatMessageSchema);
}

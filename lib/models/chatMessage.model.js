import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema({
  userName: {type: String, required: true},
  timestamp: {type: Date, required: true},
  text: {type: String, required: true},
});

export function createChatMessageModel(client) {
  return client.model('ChatMessage', chatMessageSchema);
}

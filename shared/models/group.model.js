import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  groupName: { type: String, required: true },
  eventId: { type: String, required: false },
});

export function createGroupModel(client) {
  return client.model('Group', groupSchema);
}

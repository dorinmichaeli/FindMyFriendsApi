import { nanoid } from 'nanoid';

export async function createGroup(groupModel, groupName) {
  return await groupModel
    .create({
      groupId: nanoid(12),
      groupName: groupName,
    });
}

export async function findGroupById(groupModel, groupId) {
  return await groupModel
    .findOne({
      groupId: groupId,
    });
}

export async function createGroup(groupModel, groupId, eventId, groupName) {
  return await groupModel
    .create({
      groupId: groupId,
      groupName: groupName,
      eventId: eventId,
    });
}

export async function findGroupById(groupModel, groupId) {
  return await groupModel
    .findOne({
      groupId: groupId,
    });
}

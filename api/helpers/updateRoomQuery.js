async function updateRoomQuery(roomId, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (data.status !== undefined) {
    fields.push(`status = $${idx++}`);
    values.push(data.status);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  // always update the timestamp
  fields.push(`updated = now()`);

  // push the id as the last value
  values.push(roomId)

  const query = `UPDATE rooms SET ${fields.join(", ")} WHERE id = $${idx} RETURNING id, status, player_count, updated;`;

  return [query, values];
}

export default updateRoomQuery;

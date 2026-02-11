async function updateGameQuery(gameId, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (data.status !== undefined) {
    fields.push(`status = $${idx++}`);
    values.push(data.status);
  }

  if (data.winnerUserId !== undefined) {
    fields.push(`winner_user_id = $${idx++}`);
    values.push(data.winnerUserId);
  }

  if (data.finalState !== undefined) {
    fields.push(`final_state = $${idx++}`); // Stringify to ensure Postgres sees it as a JSON string
    values.push(JSON.stringify(data.finalState));
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  fields.push(`updated = now()`);

  // push the id as the last value
  values.push(gameId);

  const query = `UPDATE games SET ${fields.join(", ")} WHERE id = $${idx} RETURNING *;`;

  return [query, values];
}

export default updateGameQuery;
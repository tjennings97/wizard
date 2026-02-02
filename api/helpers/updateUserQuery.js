import bcrypt from 'bcrypt';

async function updateUserQuery(userId, data) {
  const fields = [];
  const values = [];
  let idx = 1;

  if (data.username !== undefined) {
    fields.push(`username = $${idx++}`);
    values.push(data.username);
  }

  if (data.email !== undefined) {
    fields.push(`email = $${idx++}`);
    values.push(data.email);
  }

  if (data.password !== undefined) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(data.password, saltRounds);
    fields.push(`password_hash = $${idx++}`);
    values.push(hash);
  }

  if (data.role !== undefined) {
    fields.push(`role = $${idx++}`);
    values.push(data.role);
  }

  if (fields.length === 0) {
    throw new Error("No fields to update");
  }

  // always update the timestamp
  fields.push(`updated = now()`);

  const query = `UPDATE users SET ${fields.join(", ")} WHERE id = $${idx} RETURNING id, username, email, role, updated;`;

  return [query, values];
}

export default updateUserQuery;

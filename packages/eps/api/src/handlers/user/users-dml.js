/*
 * Functions to interface with the postgres database
 * Note the await returns are necessary to catch the key violation exceptions
 * @returns {Promise<*>}
 */
export const getUser = async (client, id) => {
  try {
    return await client.query('SELECT * FROM users WHERE id = $1', [id])
  } catch (err) {
    console.error('Error inserting into user table', err)
    throw new Error(err.message)
  }
}

export const deleteUser = async (client, id) => {
  try {
    return await client.query('DELETE FROM users WHERE id = $1', [id])
  } catch (err) {
    console.error('Error deleting into user table', err)
    throw new Error(err.message)
  }
}

export const insertIntoUsers = async (client, id, payload) => {
  try {
    if (payload.sddsId) {
      return await client.query('INSERT INTO users (id, sdds_id) values ($1, $2) RETURNING *', [id, payload.sddsId])
    } else {
      return await client.query('INSERT INTO users (id) values ($1) RETURNING *', [id])
    }
  } catch (err) {
    if (err.message.includes('users_pk')) {
      return Promise.resolve(null)
    } else {
      console.error('Error inserting into user table', err)
      throw new Error(err.message)
    }
  }
}

export const updateUsers = async (client, id, payload) => {
  try {
    if (payload.sddsId) {
      return client.query('UPDATE users SET sdds_id = $2, updated = now() WHERE id = $1 RETURNING *', [id, payload.sddsId])
    } else {
      return client.query('UPDATE users SET updated = now(), sdds_id = NULL WHERE id = $1 RETURNING *', [id])
    }
  } catch (err) {
    console.error('Error inserting into user table', err)
    throw new Error(err.message)
  }
}

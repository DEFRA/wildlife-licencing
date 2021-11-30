/*
 * Functions to interface with the postgres database
 * Note the await returns are necessary to catch the key violation exceptions
 * @returns {Promise<*>}
 */
export const insertIntoApplications = async (client, userId, applicationId, payload) => {
  try {
    return await client.query('INSERT INTO applications (id, user_id) values ($1, $2) RETURNING *',
      [applicationId, userId])
  } catch (err) {
    if (err.message.includes('applications_pk')) {
      return Promise.resolve({ rowCount: 0 })
    } else if (err.message.includes('fk_user')) {
      return Promise.resolve({ rowCount: 0 })
    } else {
      console.error('Error inserting into applications table', err)
      throw new Error(err.message)
    }
  }
}

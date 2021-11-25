import { DATABASE } from '@defra/wls-connectors-lib'

export default async context => {
  // const client = await DATABASE.getPool().connect()

  // try {
  //   const res = await client.query('SELECT * FROM users WHERE id = $1', [1])
  //   console.log(res.rows[0])
  // } catch (err) {
  //   console.error(err)
  // } finally {
  //   client.release()
  // }
  return { id: context.request.params.userId }
}

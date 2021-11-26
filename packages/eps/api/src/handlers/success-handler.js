import { DATABASE } from '@defra/wls-connectors-lib'

export default async (func, ...args) => {
  const client = await DATABASE.getPool().connect()
  try {
    return func(client, ...args)
  } catch (err) {
    console.error(err.message)
  } finally {
    client.release()
  }
}

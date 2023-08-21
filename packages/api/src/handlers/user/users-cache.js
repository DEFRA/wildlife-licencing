import { REDIS } from '@defra/wls-connectors-lib'
const { cache } = REDIS

export const clearCaches = async userId => {
  await cache.delete(`/user/${userId}`)
  await cache.delete('/users')
  const keys = await cache.keys('/users?*')
  await Promise.all(keys.map(async k => cache.delete(k)))
}

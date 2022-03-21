import { REDIS } from '@defra/wls-connectors-lib'

export default sessionCookieName => function () { // Preservers this pointer
  const getId = () => {
    if (!this.state[sessionCookieName]) {
      throw new Error()
    }

    return this.state[sessionCookieName].id
  }

  const key = `${getId()}_${this.path}`

  return {
    get: async () => REDIS.cache.restore(key),
    set: async obj => REDIS.cache.save(key, obj)
  }
}

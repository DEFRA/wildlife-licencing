import { REDIS } from '@defra/wls-connectors-lib'

export default sessionCookieName => function () { // Preservers this pointer
  const getId = () => {
    if (!this.state[sessionCookieName]) {
      throw new Error('Unexpected error - session cookie removed')
    }

    return this.state[sessionCookieName].id
  }

  const otherPageKey = opk => `${getId()}_/${opk}`
  const pageKey = `${getId()}_${this.path}`
  const authKey = `${getId()}_auth`
  const dataKey = `${getId()}_data`

  return {
    // Journey accumulated data
    getData: async () => JSON.parse(await REDIS.cache.restore(dataKey)),
    setData: async obj => REDIS.cache.save(dataKey, (obj)),

    // Authorization data
    getAuthData: async () => JSON.parse(await REDIS.cache.restore(authKey)),
    setAuthData: async obj => REDIS.cache.save(authKey, obj),

    // Page payload data for automated playback and errors
    getPageData: async () => JSON.parse(await REDIS.cache.restore(pageKey)),
    setPageData: async obj => REDIS.cache.save(pageKey, obj),
    clearPageData: async (opk = null) => REDIS.cache.delete(opk ? otherPageKey(opk) : pageKey)
  }
}

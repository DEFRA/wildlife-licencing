import { REDIS } from '@defra/wls-connectors-lib'

export default sessionCookieName => function () { // Preservers this pointer
  const getId = () => {
    if (!this.state[sessionCookieName]) {
      throw new Error()
    }

    return this.state[sessionCookieName].id
  }

  const pageKey = `${getId()}_${this.path}_page`
  const authKey = `${getId()}_auth`
  const dataKey = `${getId()}_data`

  return {
    // Journey accumulated data
    getData: async () => JSON.parse(await REDIS.cache.restore(dataKey, obj)),
    setData: async obj => REDIS.cache.save(dataKey, (obj)),

    // Authorization data
    getAuthData: async () => JSON.parse(await REDIS.cache.restore(authKey)),
    setAuthData: async obj => REDIS.cache.save(authKey, obj),

    // Page payload data for automated playback and errors
    getPageData: async () => JSON.parse(await REDIS.cache.restore(pageKey)),
    setPageData: async obj => REDIS.cache.save(pageKey, obj)
  }
}

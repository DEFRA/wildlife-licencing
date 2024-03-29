import { REDIS } from '@defra/wls-connectors-lib'
import { SESSION_COOKIE_NAME_DEFAULT } from '../constants.js'

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
    getPageData: async (opk = null) => JSON.parse(await REDIS.cache.restore(opk ? otherPageKey(opk) : pageKey)),
    setPageData: async (obj, opk = null) => REDIS.cache.save(opk ? otherPageKey(opk) : pageKey, obj),
    clearPageData: async (opk = null) => REDIS.cache.delete(opk ? otherPageKey(opk) : pageKey)
  }
}

/**
 * Validators do not have access to the request so cannot do cross-page validation
 * This is a work-around
 * usage:
 * import { cacheDirect } from '../../../../session-cache/cache-decorator.js'
 *
 * import Joi from 'joi'
 *
 * const validator = async (payload, context) => {
 *   const journeyData = await cacheDirect(context).getData()
 *   Joi.validate()
 * }
 * @param context
 * @returns {{getData: (function(): Promise<any>)}}
 */
export const cacheDirect = ({ context }) => {
  const getSessionCookieName = process.env.SESSION_COOKIE_NAME || SESSION_COOKIE_NAME_DEFAULT
  const dataKey = `${context.state[getSessionCookieName].id}_data`
  return {
    getData: async () => JSON.parse(await REDIS.cache.restore(dataKey))
  }
}

import { API } from '@defra/wls-connectors-lib'
import { apiUrls, apiRequestsWrapper } from './api-requests.js'

import db from 'debug'
const debug = db('web-service:api-requests')

export const USER = {
  getById: async userId => {
    return apiRequestsWrapper(
      async () => {
        debug(`Finding user for userId: ${userId}`)
        return API.get(`/user/${userId}`)
      },
      `Error finding user with userId ${userId}`,
      500
    )
  },
  findByName: async username => {
    return apiRequestsWrapper(
      async () => {
        debug(`Finding user by username: ${username}`)
        const users = await API.get(apiUrls.USERS, `username=${username}`)
        return users.length === 1 ? users[0] : null
      },
      `Error fetching user ${username}`,
      500
    )
  },
  create: async username => {
    return apiRequestsWrapper(
      async () => {
        debug(`Creating new user: ${username}`)
        await API.post(apiUrls.USER, { username })
      },
      `Error creating user ${username}`,
      500
    )
  }
}

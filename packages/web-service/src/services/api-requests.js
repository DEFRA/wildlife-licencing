import { API } from '@defra/wls-connectors-lib'

export const APIRequests = {
  USER: {
    findByName: async username => {
      try {
        const users = await API.get('/users', `username=${username}`)
        return users.length === 1 ? users[0] : null
      } catch (error) {
        console.error(`Error fetching user ${username}`, error)
        throw error
      }
    },
    create: async username => {
      try {
        await API.post('/user', { username })
      } catch (error) {
        console.error(`Error creating user ${username}`, error)
        throw error
      }
    }
  },
  APPLICATION: {
    create: async (userId, type) => {
      try {
        const { ref: applicationReferenceNumber } = await API.get('/applications/get-reference', `applicationType=${type}`)
        return API.post(`/user/${userId}/application`, { applicationReferenceNumber, applicationType: type })
      } catch (error) {
        console.error(`Error creating application with userId ${userId} and type ${type}`, error)
        throw error
      }
    },
    findByUser: async userId => {
      try {
        return API.get(`/user/${userId}/applications`)
      } catch (error) {
        console.error(`Error finding application with userId ${userId}`, error)
        throw error
      }
    }
  }
}

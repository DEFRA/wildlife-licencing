import { API } from '@defra/wls-connectors-lib'

export const APIRequests = {
  USER: {
    findUserByName: async username => {
      try {
        const users = await API.get('/users', `username=${username}`)
        return users.length === 1 ? users[0] : null
      } catch (error) {
        console.error(`Error fetching user ${username}`, error)
        throw error
      }
    },
    addUser: async username => {
      try {
        await API.post('/user', { username })
      } catch (error) {
        console.error(`Error creating user ${username}`, error)
        throw error
      }
    }
  }
}

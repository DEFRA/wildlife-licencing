import { API } from '@defra/wls-connectors-lib'

export const APIRequests = {
  USER: {
    findUserByName: async username => {
      try {
        const users = await API.get('/users', `username=${username}`)
        return users.length === 1 ? users[0] : null
      } catch (e) {
        console.error(`Error fetching user ${username}`, e)
      }
    },
    addUser: async username => {
      try {
        await API.post('/user', { username })
      } catch (e) {
        console.error(`Error creating user ${username}`, e)
      }
    }
  }
}

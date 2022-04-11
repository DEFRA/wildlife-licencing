import { v4 as uuidv4 } from 'uuid'
import db from 'debug'
const debug = db('web-service:sessions')

const staticMatcherPublic = /^(?:\/public\/.*|\/robots.txt|\/favicon.ico|\/health)/

export const isStaticResource = request => staticMatcherPublic.test(request.path)
export const useSessionCookie = request => !isStaticResource(request)

const sessionManager = sessionCookieName => async (request, h) => {
  if (useSessionCookie(request)) {
    if (!request.state[sessionCookieName]) {
      const id = uuidv4()
      debug(`New session cookie: ${id} create on ${request.path}`)
      h.state(sessionCookieName, { id })
      request.state[sessionCookieName] = { id }
    } else {
      const { id } = request.state[sessionCookieName]
      h.state(sessionCookieName, { id })
    }
  }

  return h.continue
}

export default sessionManager

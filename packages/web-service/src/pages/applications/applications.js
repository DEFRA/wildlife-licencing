import pageRoute from '../../routes/page-route.js'
import { APPLICATIONS } from '../../uris.js'
import fetch from 'node-fetch'

const userId = '579d4e05-e9d8-472f-a9a9-3fc52234d88b'

export async function fetchApplications(userId) {
  try {
    const response = await fetch(`${process.env.API_HOST}:${process.env.API_PORT}/user/${userId}/applications`)
    return response.json()
  } catch (exception) {
    console.error(exception)
  }
}

export const getData = async request => {
  const applications = await fetchApplications(userId)
  return { applications }
}

export default pageRoute(APPLICATIONS.page, APPLICATIONS.uri, null, '', getData)

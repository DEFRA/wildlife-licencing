import pageRoute from '../../routes/page-route.js'
import { APPLICATIONS } from '../../uris.js'
import fetch from 'node-fetch'

const tempUserId = '579d4e05-e9d8-472f-a9a9-3fc52234d88b'

async function fetchApplications (userId) {
  try {
    return await fetch(`${process.env.SERVER_URL}/user/${userId}/applications`).then(response => response.json())
  } catch (exception) {
    console.error(exception)
    return []
  }
}

export const getData = async () => {
  const applications = await fetchApplications(tempUserId)
  return { applications }
}

export default pageRoute(APPLICATIONS.page, APPLICATIONS.uri, null, '', getData)

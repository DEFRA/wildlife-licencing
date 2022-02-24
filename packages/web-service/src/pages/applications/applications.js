import pageRoute from '../../routes/page-route.js'
import { APPLICATIONS } from '../../uris.js'
import fetch from 'node-fetch'

const userId = '579d4e05-e9d8-472f-a9a9-3fc52234d88b'

async function fetchApplications(userId) {
  try {
    return await fetch(`http://localhost:3000/user/${userId}/applications`)
      .then((response) => response.json())
  } catch (exception) {
    console.error(exception)
  }
}

export const getData = async request => {
  const applications = await fetchApplications(userId)
  console.log(1)
  return { applications }
}

export default pageRoute(APPLICATIONS.page, APPLICATIONS.uri, null, '', getData)

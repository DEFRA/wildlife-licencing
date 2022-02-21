import { ApplicationsSchema } from '../models/application.js'
import fetch from 'node-fetch'

// todo: using fake user id temporarily until users are intgerated
const userId = '579d4e05-e9d8-472f-a9a9-3fc52234d88b'

export default async (request, handler) => {
  let applications = await fetchApplications(userId)

  console.log(applications)

  return handler.view('app/applications.njk', { applications })
}

async function fetchApplications(userId) {
  try {
    // todo: need to create a service file for common fetch functions
    // todo: replace localhost string with process env value
    const fetchedApplications =
      await fetch(`http://localhost:3000/user/${userId}/applications`)
        .then((response) => response.json())

    const validatedFetchedApplications = ApplicationsSchema.validate(fetchedApplications)

    if (validatedFetchedApplications.error) {
      throw new Error(validatedFetchedApplications.error)
    }

    return validatedFetchedApplications.value
  } catch (exception) {
    console.error(exception)
  }
}

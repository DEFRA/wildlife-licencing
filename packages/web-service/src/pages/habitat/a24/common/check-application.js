import { APPLICATIONS } from '../../../../uris.js'

export const checkApplication = async request => {
  const journeyData = await request.cache().getData()

  if (!journeyData.applicationId) {
    return APPLICATIONS.uri
  }

  return undefined
}

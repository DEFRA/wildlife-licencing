import { APPLICATIONS } from '../../../../uris.js'

export const checkApplication = async request => {
  const journeyData = request.cache().getData()

  if (!journeyData.applicationId) {
    return APPLICATIONS.uri
  }

  return undefined
}

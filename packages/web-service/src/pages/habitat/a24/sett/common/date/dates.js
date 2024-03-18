import { APIRequests } from '../../../../../../services/api-requests.js'
import { A24_SETT } from '../../../../../tasklist/a24-badger-licence.js'
import { isCompleteOrConfirmed } from '../../../../../common/tag-functions.js'
import { habitatURIs } from '../../../../../../uris.js'
import { getHabitatById } from '../../../common/get-habitat-by-id.js'
import { putHabitatById } from '../../../common/put-habitat-by-id.js'

export const getDateData = (dateToGet) => {
  if (dateToGet) {
    const date = new Date(dateToGet)
    return {
      year: date.getFullYear(),
      month: date.getMonth() + 1,
      day: date.getDate()
    }
  }
  return null
}

export const dateCompletion = async (journeyData, uri) => {
  const tagState = await APIRequests.APPLICATION.tags(journeyData.applicationId).get(A24_SETT)
  if (isCompleteOrConfirmed(tagState)) {
    return habitatURIs.CHECK_YOUR_ANSWERS.uri
  }
  return uri
}


import pageRoute from '../../routes/page-route.js'
import { TASKLIST } from '../../uris.js'
import {
  licenceTypeMap, A24, getStatus, SECTION_TASKS, updateStatusCache,
  STATUS_VALUES, decorateMap, getProgress
} from './licence-type-map.js'

export const getData = async request => {
  // Placeholder - this will be replaced by a state-machine
  const eligibilityStatus = await getStatus(SECTION_TASKS.ELIGIBILITY_CHECK)(request)
  if (eligibilityStatus === STATUS_VALUES.CANNOT_START_YET) {
    await updateStatusCache(request, SECTION_TASKS.ELIGIBILITY_CHECK, STATUS_VALUES.NOT_STARTED)
  }

  const decoratedMap = await decorateMap(request, licenceTypeMap[A24])
  const progress = getProgress(decoratedMap)

  return {
    licenceType: A24,
    licenceTypeMap: decoratedMap,
    progress
  }
}

export const tasklist = pageRoute(TASKLIST.page, TASKLIST.uri, null,
  getData, null, null, null)

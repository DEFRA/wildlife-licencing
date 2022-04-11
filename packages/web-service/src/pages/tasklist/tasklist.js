import pageRoute from '../../routes/page-route.js'
import { TASKLIST } from '../../uris.js'
import { licenceTypeMap, A24 } from '../../licence-type-map.js'

const LICENCE_TYPE = 'A24 Badger'

// Takes the static, read-only map and decorates it with state data derived from the cache
const getData = async request => {
  const auth = await request.cache().getAuthData()
  const currentMap = licenceTypeMap[LICENCE_TYPE]
  const decoratedMap = currentMap.sections.map(s => ({
    ...s,
    tasks: s.tasks.map(t => ({ ...t, enabled: t.enabled(auth, []) }))
  }))
  console.log(JSON.stringify(decoratedMap, null, 4))
  return {
    licenceType: A24,
    licenceTypeMap: decoratedMap
  }
}

export const tasklist = pageRoute(TASKLIST.page, TASKLIST.uri, null,
  getData, null, null, null)

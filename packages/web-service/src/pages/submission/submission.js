import pageRoute from '../../routes/page-route.js'
import { SUBMISSION, APPLICATIONS, TASKLIST } from '../../uris.js'
import { Backlink } from '../../handlers/backlink.js'
import { countCompleteSections } from '../common/count-complete-sections.js'
import { SECTION_TASKS } from '../tasklist/licence-type-map.js'

export const checkData = async (request, h) => {
  const { applicationId } = await request.cache().getData()

  const totalSections = Object.keys(SECTION_TASKS).length - 2 // TEMP TODO
  const totalCompletedSections = await countCompleteSections(applicationId)

  if (totalCompletedSections.length < totalSections) {
    return h.redirect(TASKLIST.uri)
  }

  return null
}

export default pageRoute({
  page: SUBMISSION.page,
  uri: SUBMISSION.uri,
  completion: APPLICATIONS.uri,
  backlink: Backlink.NO_BACKLINK,
  checkData
})

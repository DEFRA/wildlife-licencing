import pageRoute from '../../routes/page-route.js'
import { Backlink } from '../../handlers/backlink.js'

export const checkAnswersPage = ({ page, uri, checkData, getData, setData, completion, options }) => pageRoute({
  page,
  uri,
  checkData,
  getData,
  completion,
  setData,
  options,
  backlink: Backlink.NO_BACKLINK
})

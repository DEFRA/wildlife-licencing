import pageRoute from '../../routes/page-route.js'
import { Backlink } from '../../handlers/backlink.js'

export const checkAnswersPage = ({ page, uri, checkData, getData, setData, validator, completion, options }) => pageRoute({
  page,
  uri,
  checkData,
  getData,
  validator,
  completion,
  setData,
  options,
  backlink: Backlink.NO_BACKLINK
})

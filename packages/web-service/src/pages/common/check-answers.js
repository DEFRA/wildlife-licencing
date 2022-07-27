import pageRoute from '../../routes/page-route.js'

export const checkAnswersPage = ({ page, uri, checkData, getData, setData, completion, options }) => pageRoute({
  page,
  uri,
  checkData,
  getData,
  completion,
  setData,
  options
})

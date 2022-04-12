import pageRoute from '../../routes/page-route.js'

export const checkAnswersPage = (uri, checkData, getData, setData, completion, options) => pageRoute(
  uri.page,
  uri.uri,
  checkData,
  getData,
  null,
  completion,
  setData,
  options
)

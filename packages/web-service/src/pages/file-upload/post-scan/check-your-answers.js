import { CHECK_YOUR_ANSWERS, FILE_UPLOAD } from '../../../uris.js'
import pageRoute from '../../../routes/page-route.js'

const checkData = async (request, h) => {
  // You can't hit this page directly, unless you've already uploaded a file
  // If not, bounce the user back to the file-upload page
  const authData = await request.cache().getAuthData() || {}

  if (authData.virusPresent !== false) {
    return h.redirect(FILE_UPLOAD.uri)
  }

  return null
}

// const completion = async () => {}

export const checkYourAnswers = pageRoute(CHECK_YOUR_ANSWERS.page, CHECK_YOUR_ANSWERS.uri, checkData, null, null, /* completion */ null)

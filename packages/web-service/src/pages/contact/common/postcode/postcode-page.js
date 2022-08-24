import pageRoute from '../../../../routes/page-route.js'
import Joi from 'joi'

// This is the pattern use by the rod-licensing service which has been in production for a number of years
// and has large volume of transaction albeit largely domestic addresses
export const ukPostcodeRegex = /^([A-PR-UWYZ][0-9]{1,2}[A-HJKPSTUW]?|[A-PR-UWYZ][A-HK-Y][0-9]{1,2}[ABEHMNPRVWXY]?)\s{0,6}([0-9][A-Z]{2})$/i

export const postcodePage = ({ page, uri, checkData, getData, completion, setData }) =>
  pageRoute({
    page,
    uri,
    checkData,
    getData,
    completion,
    setData,
    validator: Joi.object({
      postcode: Joi.string().trim().min(1).max(12).required().pattern(ukPostcodeRegex)
        .replace(ukPostcodeRegex, '$1 $2').uppercase()
    }).options({ abortEarly: false, allowUnknown: true })
  })

import isFuture from 'date-fns/isFuture/index.js'
import { throwJoiError } from './error-handler.js'
import { LicenceTypeConstants } from '../../../../common/licence-type-constants.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
import { inDateWindow } from '../../../../common/date-utils.js'

export const validateDateInFuture = (pageDate, pageName) => {
  // Is this in the past?
  if (!isFuture(pageDate)) {
    throwJoiError(pageName, 'Error', 'dateHasPassed')
  }
}

/**
 *
 * @param {Date} pageDate - the test date
 * @param pageName
 */
export const validateDateInWindow = (pageDate, pageName) => {
  const { CLOSED_SEASON_START, CLOSED_SEASON_END } =
    LicenceTypeConstants[PowerPlatformKeys.APPLICATION_TYPES.A24]

  if (inDateWindow(pageDate,
    { month: CLOSED_SEASON_START.month, date: CLOSED_SEASON_START.date },
    { month: CLOSED_SEASON_END.month, date: CLOSED_SEASON_END.date })) {
    throwJoiError(pageName, null, 'outsideLicence')
  }
}

export const isDateInFuture = (pageDate, pageName) => {
  // Is this date in the future?
  if (isFuture(pageDate)) {
    throwJoiError(pageName, 'Error', 'dataInFuture')
  }
}

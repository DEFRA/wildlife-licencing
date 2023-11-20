import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'

export const getSddsRatingValue = rating => {
  return PowerPlatformKeys.FEEDBACK_RATINGS[rating]
}

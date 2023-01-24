import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'

export const LicenceTypeConstants = {
  [PowerPlatformKeys.APPLICATION_TYPES.A24]: {
    CLOSED_SEASON_START: { month: 12, date: 1 },
    CLOSED_SEASON_END: { month: 4, date: 30 },
    WARNING_PAGE_START: { month: 12, date: 1 },
    WARNING_PAGE_END: { month: 4, date: 1 },
    MAX_MONTHS_DURATION: 7
  }
}

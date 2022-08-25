import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'
const { SETT_TYPE: { MAIN_NO_ALTERNATIVE_SETT, ANNEXE, SUBSIDIARY, OUTLIER } } = PowerPlatformKeys

export const settTypes = [
  {
    value: MAIN_NO_ALTERNATIVE_SETT,
    text: 'Main'
  },
  {
    value: ANNEXE,
    text: 'Annexe'
  },
  {
    value: SUBSIDIARY,
    text: 'Subsidiary'
  },
  {
    value: OUTLIER,
    text: 'Outlier'
  }
]

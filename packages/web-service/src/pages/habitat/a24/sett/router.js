import settStart from './sett-start.js'
import settName from './sett-name.js'
import settEntrancesValue from './sett-entrances-value.js'
import settUseCategory from './sett-use-category.js'
import settReopenedAfterDevelopment from './sett-reopened-after-development.js'
import settActiveEntranceTotal from './sett-active-entrance-total.js'
import settGridReference from './sett-grid-reference.js'
import startDateLicensedActivityOnThisSett from './start-date-licensed-activity-on-this-sett.js'
import endDateLicensedActivityOnThisSett from './end-date-licensed-activity-on-this-sett.js'
import settDisturbanceMethods from './sett-disturbance-methods.js'
export default [
  ...settStart,
  ...settName,
  ...settUseCategory,
  ...settReopenedAfterDevelopment,
  ...settEntrancesValue,
  ...settActiveEntranceTotal,
  ...settGridReference,
  ...startDateLicensedActivityOnThisSett,
  ...endDateLicensedActivityOnThisSett,
  ...settDisturbanceMethods
]

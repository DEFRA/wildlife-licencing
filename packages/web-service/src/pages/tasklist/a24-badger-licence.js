import { LicenceType } from './licence-type.js'
import { SECTION_TASKS, SECTIONS, TASKS } from './general-sections.js'

export const A24 = new LicenceType('A24 Badger', [
  {
    section: SECTIONS.CHECK_BEFORE_YOU_START,
    tasks: [
      TASKS[SECTION_TASKS.ELIGIBILITY_CHECK]
    ]
  }
])

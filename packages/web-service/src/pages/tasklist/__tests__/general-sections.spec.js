import { tagStatus } from '../../../services/status-tags.js'
import { contactURIs } from '../../../uris.js'
import { TASKS, SECTION_TASKS } from '../general-sections.js'

describe('tasklist general sections', () => {
  beforeEach(() => jest.resetModules())

  it('eligibility check', () => {
    const task = TASKS[SECTION_TASKS.ELIGIBILITY_CHECK]
    expect(task.uri([])).toEqual('/landowner')
    expect(task.uri([{ tag: SECTION_TASKS.ELIGIBILITY_CHECK, tagState: tagStatus.COMPLETE }])).toEqual('/eligibility-check')

    expect(expect(task.status([])).toEqual(tagStatus.NOT_STARTED))
    expect(expect(task.status([{ tag: SECTION_TASKS.ELIGIBILITY_CHECK, tagState: tagStatus.COMPLETE }])).toEqual('complete'))

    expect(task.enabled([])).toBeTruthy()
    expect(task.enabled([{ tag: SECTION_TASKS.ELIGIBILITY_CHECK, tagState: tagStatus.COMPLETE }])).toBeFalsy()
  })

  it('applicant check', () => {
    const task = TASKS[SECTION_TASKS.APPLICANT]
    expect(task.uri([])).toEqual('/applicant-name')
    expect(task.uri([{ tag: SECTION_TASKS.APPLICANT, tagState: tagStatus.COMPLETE }])).toEqual(contactURIs.APPLICANT.CHECK_ANSWERS)

    expect(expect(task.status([])).toEqual(tagStatus.CANNOT_START))
    expect(expect(task.status([
      { tag: SECTION_TASKS.APPLICANT, tagState: tagStatus.COMPLETE }
    ])).toEqual('complete'))

    expect(task.enabled([])).toBeFalsy()
    expect(task.enabled([
      { tag: SECTION_TASKS.APPLICANT, tagState: tagStatus.COMPLETE },
      { tag: SECTION_TASKS.ELIGIBILITY_CHECK, tagState: tagStatus.COMPLETE }
    ])).toBeTruthy()
  })

  it('ecologist check', () => {
    const task = TASKS[SECTION_TASKS.ECOLOGIST]
    expect(task.uri([])).toEqual('/ecologist-name')
    expect(task.uri([{ tag: SECTION_TASKS.ECOLOGIST, tagState: tagStatus.COMPLETE }])).toEqual('/ecologist-check-answers')

    expect(expect(task.status([])).toEqual(tagStatus.CANNOT_START))
    expect(expect(task.status([
      { tag: SECTION_TASKS.ECOLOGIST, tagState: tagStatus.COMPLETE }
    ])).toEqual('complete'))

    expect(task.enabled([])).toBeFalsy()
    expect(task.enabled([
      { tag: SECTION_TASKS.ECOLOGIST, tagState: tagStatus.COMPLETE },
      { tag: SECTION_TASKS.ELIGIBILITY_CHECK, tagState: tagStatus.COMPLETE }
    ])).toBeTruthy()
  })

  it('authorised people', () => {
    const task = TASKS[SECTION_TASKS.AUTHORISED_PEOPLE]
    expect(task.uri([])).toEqual('/add-authorised-person')
    expect(task.uri([{ tag: SECTION_TASKS.AUTHORISED_PEOPLE, tagState: tagStatus.COMPLETE }])).toEqual('/add-authorised-person')

    expect(expect(task.status([])).toEqual(tagStatus.CANNOT_START))
    expect(expect(task.status([
      { tag: SECTION_TASKS.AUTHORISED_PEOPLE, tagState: tagStatus.COMPLETE }
    ])).toEqual('complete'))

    expect(task.enabled([])).toBeFalsy()
    expect(task.enabled([
      { tag: SECTION_TASKS.AUTHORISED_PEOPLE, tagState: tagStatus.COMPLETE },
      { tag: SECTION_TASKS.ELIGIBILITY_CHECK, tagState: tagStatus.COMPLETE }
    ])).toBeTruthy()
  })

  it('additional applicant', () => {
    const task = TASKS[SECTION_TASKS.ADDITIONAL_APPLICANT]
    expect(task.uri([])).toEqual('/add-additional-applicant')
    expect(task.uri([{ tag: SECTION_TASKS.ADDITIONAL_APPLICANT, tagState: tagStatus.COMPLETE }])).toEqual('/additional-applicant-check-answers')

    expect(expect(task.status([])).toEqual(tagStatus.CANNOT_START))
    expect(expect(task.status([
      { tag: SECTION_TASKS.ADDITIONAL_APPLICANT, tagState: tagStatus.COMPLETE }
    ])).toEqual('complete'))

    expect(task.enabled([])).toBeFalsy()
    expect(task.enabled([
      { tag: SECTION_TASKS.ADDITIONAL_APPLICANT, tagState: tagStatus.NOT_STARTED },
      { tag: SECTION_TASKS.APPLICANT, tagState: tagStatus.COMPLETE }
    ])).toBeTruthy()
  })

  it('additional ecologist', () => {
    const task = TASKS[SECTION_TASKS.ADDITIONAL_ECOLOGIST]
    expect(task.uri([])).toEqual('/add-additional-ecologist')
    expect(task.uri([{ tag: SECTION_TASKS.ADDITIONAL_ECOLOGIST, tagState: tagStatus.COMPLETE }])).toEqual('/additional-ecologist-check-answers')

    expect(expect(task.status([])).toEqual(tagStatus.CANNOT_START))
    expect(expect(task.status([
      { tag: SECTION_TASKS.ADDITIONAL_ECOLOGIST, tagState: tagStatus.COMPLETE }
    ])).toEqual('complete'))

    expect(task.enabled([])).toBeFalsy()
    expect(task.enabled([
      { tag: SECTION_TASKS.ADDITIONAL_ECOLOGIST, tagState: tagStatus.NOT_STARTED },
      { tag: SECTION_TASKS.ECOLOGIST, tagState: tagStatus.COMPLETE }
    ])).toBeTruthy()
  })

  it('payer', () => {
    const task = TASKS[SECTION_TASKS.INVOICE_PAYER]
    expect(task.uri([])).toEqual('/invoice-responsible')
    expect(task.uri([{ tag: SECTION_TASKS.INVOICE_PAYER, tagState: tagStatus.COMPLETE }])).toEqual('/invoice-check-answers')

    expect(expect(task.status([])).toEqual(tagStatus.CANNOT_START))
    expect(expect(task.status([
      { tag: SECTION_TASKS.INVOICE_PAYER, tagState: tagStatus.COMPLETE }
    ])).toEqual('complete'))

    expect(task.enabled([])).toBeFalsy()
    expect(task.enabled([
      { tag: SECTION_TASKS.INVOICE_PAYER, tagState: tagStatus.NOT_STARTED },
      { tag: SECTION_TASKS.APPLICANT, tagState: tagStatus.COMPLETE },
      { tag: SECTION_TASKS.ECOLOGIST, tagState: tagStatus.COMPLETE }
    ])).toBeTruthy()
  })

  it('work activity', () => {
    const task = TASKS[SECTION_TASKS.WORK_ACTIVITY]
    expect(task.uri([])).toEqual('/work-proposal')
    expect(task.uri([{ tag: SECTION_TASKS.WORK_ACTIVITY, tagState: tagStatus.COMPLETE }])).toEqual('/check-work-answers')
    expect(expect(task.status([])).toEqual(tagStatus.CANNOT_START))
    expect(task.enabled([])).toBeFalsy()
  })

  it('permissions', () => {
    const task = TASKS[SECTION_TASKS.PERMISSIONS]
    expect(task.uri([])).toEqual('/permissions')
    expect(task.uri([{ tag: SECTION_TASKS.PERMISSIONS, tagState: tagStatus.COMPLETE }])).toEqual('/check-your-answers')
    expect(expect(task.status([])).toEqual(tagStatus.CANNOT_START))
    expect(task.enabled([])).toBeFalsy()
    expect(task.enabled([
      { tag: SECTION_TASKS.PERMISSIONS, tagState: tagStatus.CANNOT_START },
      { tag: SECTION_TASKS.ELIGIBILITY_CHECK, tagState: tagStatus.COMPLETE }
    ])).toBeTruthy()
  })

  it('sites', () => {
    const task = TASKS[SECTION_TASKS.SITES]
    expect(task.uri([])).toEqual('/site-name')
    expect(task.uri([{ tag: SECTION_TASKS.SITES, tagState: tagStatus.COMPLETE }])).toEqual('/check-site-answers')

    expect(expect(task.status([])).toEqual(tagStatus.CANNOT_START))
    expect(expect(task.status([
      { tag: SECTION_TASKS.SITES, tagState: tagStatus.COMPLETE }
    ])).toEqual('complete'))

    expect(task.enabled([])).toBeFalsy()
    expect(task.enabled([
      { tag: SECTION_TASKS.SITES, tagState: tagStatus.NOT_STARTED },
      { tag: SECTION_TASKS.ELIGIBILITY_CHECK, tagState: tagStatus.COMPLETE }
    ])).toBeTruthy()
  })

  it('ecologist experience', () => {
    const task = TASKS[SECTION_TASKS.ECOLOGIST_EXPERIENCE]
    expect(task.uri([])).toEqual('/previous-licence')
    expect(task.uri([{ tag: SECTION_TASKS.ECOLOGIST_EXPERIENCE, tagState: tagStatus.COMPLETE }])).toEqual('/check-ecologist-answers')

    expect(expect(task.status([])).toEqual(tagStatus.CANNOT_START))
    expect(expect(task.status([
      { tag: SECTION_TASKS.ECOLOGIST_EXPERIENCE, tagState: tagStatus.COMPLETE }
    ])).toEqual('complete'))

    expect(task.enabled([])).toBeFalsy()
    expect(task.enabled([
      { tag: SECTION_TASKS.ECOLOGIST_EXPERIENCE, tagState: tagStatus.NOT_STARTED },
      { tag: SECTION_TASKS.ELIGIBILITY_CHECK, tagState: tagStatus.COMPLETE }
    ])).toBeTruthy()
  })

  it('supporting information', () => {
    const task = TASKS[SECTION_TASKS.SUPPORTING_INFORMATION]
    expect(task.uri([])).toEqual('/upload-supporting-information')
    expect(task.uri([{ tag: SECTION_TASKS.SUPPORTING_INFORMATION, tagState: tagStatus.COMPLETE }])).toEqual('/check-supporting-information')

    expect(expect(task.status([])).toEqual(tagStatus.CANNOT_START))
    expect(expect(task.status([
      { tag: SECTION_TASKS.SUPPORTING_INFORMATION, tagState: tagStatus.COMPLETE }
    ])).toEqual('complete'))

    expect(task.enabled([])).toBeFalsy()
    expect(task.enabled([
      { tag: SECTION_TASKS.SUPPORTING_INFORMATION, tagState: tagStatus.NOT_STARTED },
      { tag: SECTION_TASKS.ELIGIBILITY_CHECK, tagState: tagStatus.COMPLETE }
    ])).toBeTruthy()
  })

  it('declare convictions', () => {
    const task = TASKS[SECTION_TASKS.DECLARE_CONVICTIONS]
    expect(task.uri([])).toEqual('/any-convictions')
    expect(task.uri([{ tag: SECTION_TASKS.DECLARE_CONVICTIONS, tagState: tagStatus.COMPLETE }])).toEqual('/convictions-check-answers')

    expect(expect(task.status([])).toEqual(tagStatus.CANNOT_START))
    expect(expect(task.status([
      { tag: SECTION_TASKS.DECLARE_CONVICTIONS, tagState: tagStatus.COMPLETE }
    ])).toEqual('complete'))

    expect(task.enabled([])).toBeFalsy()
    expect(task.enabled([
      { tag: SECTION_TASKS.DECLARE_CONVICTIONS, tagState: tagStatus.NOT_STARTED },
      { tag: SECTION_TASKS.ELIGIBILITY_CHECK, tagState: tagStatus.COMPLETE }
    ])).toBeTruthy()
  })

  it('submit', () => {
    const task = TASKS[SECTION_TASKS.SUBMIT]({
      status: jest.fn().mockReturnValue(tagStatus.NOT_STARTED),
      enabled: jest.fn().mockReturnValue(false)
    })
    expect(task.uri([])).toEqual('/declaration')
    expect(expect(task.status([])).toEqual(tagStatus.NOT_STARTED))
    expect(task.enabled([])).toBeFalsy()
  })
})

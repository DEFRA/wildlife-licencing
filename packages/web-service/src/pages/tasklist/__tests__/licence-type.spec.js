import { tagStatus } from '../../../services/status-tags.js'
import { hasTaskStatusOf } from '../licence-type.js'
import { PowerPlatformKeys } from '@defra/wls-powerapps-keys'

const TASKS = {
  ELIGIBILITY_CHECK: 'eligibility-check',
  LICENCE_HOLDER: 'licence-holder',
  ECOLOGIST: 'ecologist',
  PAYER: 'payer',
  SITES: 'sites',
  EXPERIENCE: 'experience'
}
const tags = [
  {
    tag: TASKS.ELIGIBILITY_CHECK,
    tagState: tagStatus.COMPLETE
  },
  {
    tag: TASKS.LICENCE_HOLDER,
    tagState: tagStatus.IN_PROGRESS
  },
  {
    tag: TASKS.ECOLOGIST,
    tagState: tagStatus.CANNOT_START
  },
  {
    tag: TASKS.PAYER,
    tagState: tagStatus.COMPLETE_NOT_CONFIRMED
  },
  {
    tag: TASKS.SITES,
    tagState: tagStatus.NOT_STARTED
  },
  {
    tag: TASKS.EXPERIENCE,
    tagState: tagStatus.COMPLETE
  }
]

describe('The licence type class', () => {
  beforeEach(() => jest.resetModules())

  it('the isAppSubmittable function', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          tags: () => ({ getAll: () => [] }),
          getById: () => ({ applicationTypeId: PowerPlatformKeys.APPLICATION_TYPES.A24 })
        }
      }
    }))
    const { isAppSubmittable, LicenceType, LICENCE_TYPE_TASKLISTS } = await import('../licence-type.js')
    LICENCE_TYPE_TASKLISTS[PowerPlatformKeys.APPLICATION_TYPES.A24] = new LicenceType({
      canSubmitFunc: () => true
    })
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '739f4e35-9e06-4585-b52a-c4144d94f7f7'
        })
      })
    }
    const result = await isAppSubmittable(request)
    await expect(result).toBeTruthy()
    LICENCE_TYPE_TASKLISTS[PowerPlatformKeys.APPLICATION_TYPES.A24] = new LicenceType({
      canSubmitFunc: () => false
    })
    const result2 = await isAppSubmittable(request)
    await expect(result2).toBeFalsy()
  })

  it('the tag functions  ', async () => {
    const {
      getTaskStatus,
      hasTaskStatusOf,
      hasTaskStatusIn,
      hasTaskCompleted,
      hasTaskCompletedOrCompletedNotConfirmed,
      haveTasksCompleted,
      countTasksCompleted
    } = await import('../licence-type.js')
    expect(getTaskStatus(TASKS.ECOLOGIST, tags)).toEqual(tagStatus.CANNOT_START)
    expect(hasTaskStatusOf(TASKS.ECOLOGIST, tags, tagStatus.COMPLETE)).toBeFalsy()
    expect(hasTaskStatusIn(TASKS.ECOLOGIST, tags, tagStatus.COMPLETE, tagStatus.CANNOT_START)).toBeTruthy()
    expect(hasTaskCompleted(TASKS.ELIGIBILITY_CHECK, tags)).toBeTruthy()
    expect(hasTaskCompletedOrCompletedNotConfirmed(TASKS.ECOLOGIST, tags)).toBeFalsy()
    expect(haveTasksCompleted([TASKS.EXPERIENCE, TASKS.ELIGIBILITY_CHECK], tags)).toBeTruthy()
    expect(haveTasksCompleted([TASKS.EXPERIENCE, TASKS.PAYER], tags)).toBeFalsy()
    expect(countTasksCompleted(Object.values(TASKS), tags)).toEqual(2)
  })

  it('the licence type class', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          tags: () => ({ getAll: () => tags })
        }
      }
    }))
    const mockCanShow = jest.fn().mockReturnValue(true)
    const mockGetProgress = jest.fn().mockReturnValue({ complete: 1, from: 4 })
    const mockCanSubmit = jest.fn().mockReturnValue(true)
    const { LicenceType, getTaskStatus } = await import('../licence-type.js')
    const licenceType = new LicenceType({
      name: 'some random licence',
      canShowReferenceFunc: mockCanShow,
      getProgressFunc: mockGetProgress,
      canSubmitFunc: mockCanSubmit,
      sectionTasks: [{
        section: { name: 'First section' },
        tasks: [{
          name: TASKS.ECOLOGIST,
          uri: () => '/uri',
          status: t => getTaskStatus(TASKS.ECOLOGIST, t),
          enabled: t => hasTaskStatusOf(TASKS.ELIGIBILITY_CHECK, t, tagStatus.COMPLETE)
        }]
      }]
    })
    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: '8d79bc16-02fe-4e3c-85ac-b8d792b59b94',
          applicationRole: 'ECOLOGIST'
        }))
      })
    }
    const result = await licenceType.decorate(request)
    expect(result).toEqual([{ name: 'First section', tasks: [{ enabled: true, name: 'ecologist', status: 'cannot-start', uri: '/uri' }] }])
    const csr = await licenceType.canShowReference(request)
    expect(csr).toBeTruthy()
    expect(mockCanShow).toHaveBeenCalledWith(tags)
    const gp = await licenceType.getProgress(request)
    expect(gp).toEqual({ complete: 1, from: 4 })
    expect(mockGetProgress).toHaveBeenCalledWith(tags)
    const cs = await licenceType.canSubmit(request)
    expect(cs).toBeTruthy()
    expect(mockCanSubmit).toHaveBeenCalledWith(tags, 'ECOLOGIST')
  })
})

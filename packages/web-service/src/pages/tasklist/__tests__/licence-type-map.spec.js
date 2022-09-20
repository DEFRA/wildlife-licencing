import {
  A24,
  licenceTypeMap,
  SECTION_TASKS,
  getProgress,
  decorateMap
} from '../licence-type-map.js'

describe('The licence type map', () => {
  beforeEach(() => jest.resetModules())

  it('the getTaskStatus function works as expected', async () => {
    const request = {
      cache: () => ({
        getData: () => ({ applicationId: '8a3e8c32-0138-402c-8913-87e78ed44ebd' })
      })
    }
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: jest.fn(() => ({
            applicationTags: ['eligibility-check']
          }))
        }
      }
    }))
    const { getTaskStatus } = await import('../licence-type-map.js')
    const taskStatus = await getTaskStatus(request)
    expect(taskStatus).toEqual(expect.objectContaining({ 'eligibility-check': true }))
  })

  it('the decorateMap function works as expected', async () => {
    const decoratedMap = await decorateMap(licenceTypeMap[A24], { 'eligibility-check': true })
    const startCheck = decoratedMap.find(m => m.name === 'check-before-you-start')
    const eligibilityCheck = startCheck.tasks.find(t => t.name === SECTION_TASKS.ELIGIBILITY_CHECK)
    expect(eligibilityCheck).toEqual({
      enabled: false, name: 'eligibility-check', status: 'completed', uri: '/eligibility-check'
    })
  })

  it('the getProgress function works as expected', async () => {
    const progress = getProgress({ first: true, second: false })
    expect(progress).toEqual({ completed: 1, from: 2 })
  })

  it('the section tasks SETT will return completed if status is complete', async () => {
    const { licenceTypeMap } = await import('../licence-type-map.js')
    const { A24 } = await import('../licence-type-map.js')
    const funcEnabled = licenceTypeMap[A24].sections[2].tasks[3].enabled
    const funcStatus = licenceTypeMap[A24].sections[2].tasks[3].status
    expect(licenceTypeMap[A24].sections[2].tasks[3]).toEqual({ enabled: funcEnabled, status: funcStatus, name: 'setts', uri: '/habitat-start' })
  })
})

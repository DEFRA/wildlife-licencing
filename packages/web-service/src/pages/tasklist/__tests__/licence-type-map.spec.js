import {
  A24,
  licenceTypeMap,
  updateStatusCache,
  STATUS_VALUES,
  SECTION_TASKS,
  getStatus,
  getProgress,
  decorateMap
} from '../licence-type-map.js'

describe('The licence type map', () => {
  it('the updateStatusCache function works as expected', async () => {
    const mockSetData = jest.fn()
    const request = {
      cache: () => ({
        getData: () => ({}),
        setData: mockSetData
      })
    }
    await updateStatusCache(request, SECTION_TASKS.ELIGIBILITY_CHECK, STATUS_VALUES.COMPLETED)
    expect(mockSetData).toHaveBeenCalledWith({ tasks: { 'eligibility-check': 'completed' } })
  })

  it('the getStatus function returns a set status', async () => {
    const request = {
      cache: () => ({
        getData: () => ({ tasks: { 'eligibility-check': 'in-progress' } })
      })
    }
    const result = await getStatus(SECTION_TASKS.ELIGIBILITY_CHECK)(request)
    expect(result).toBe(STATUS_VALUES.IN_PROGRESS)
  })

  it('the getStatus function returns cannot start yet as the default (1)', async () => {
    const request = {
      cache: () => ({
        getData: () => ({ tasks: {} })
      })
    }
    const result = await getStatus(SECTION_TASKS.ELIGIBILITY_CHECK)(request)
    expect(result).toBe(STATUS_VALUES.CANNOT_START_YET)
  })

  it('the getStatus function returns cannot start yet as the default (2)', async () => {
    const request = {
      cache: () => ({
        getData: () => ({})
      })
    }
    const result = await getStatus(SECTION_TASKS.ELIGIBILITY_CHECK)(request)
    expect(result).toBe(STATUS_VALUES.CANNOT_START_YET)
  })

  it('the decorateMap function works as expected', async () => {
    const request = {
      cache: () => ({
        getData: () => ({})
      })
    }
    const decoratedMap = await decorateMap(request, licenceTypeMap[A24])
    const startCheck = decoratedMap.find(m => m.name === 'check-before-you-start')
    const eligibilityCheck = startCheck.tasks.find(t => t.name === SECTION_TASKS.ELIGIBILITY_CHECK)
    const result = { name: 'eligibility-check', status: 'cannot-start', uri: '/landowner' }
    expect(eligibilityCheck).toEqual(result)
  })

  it('the getProgress function works as expected', async () => {
    const request = {
      cache: () => ({
        getData: () => ({ tasks: { 'eligibility-check': 'completed' } })
      })
    }
    const decoratedMap = await decorateMap(request, licenceTypeMap[A24])
    const startCheck = decoratedMap.find(m => m.name === 'check-before-you-start')
    const eligibilityCheck = startCheck.tasks.find(t => t.name === SECTION_TASKS.ELIGIBILITY_CHECK)
    const result = { name: 'eligibility-check', status: 'completed', uri: '/eligibility-check' }
    expect(eligibilityCheck).toEqual(result)
    const progress = getProgress(decoratedMap)
    expect(progress).toEqual({ completed: 1, from: 8 })
  })
})

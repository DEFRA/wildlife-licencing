import { v4 as uuidv4 } from 'uuid'

describe('The task-list handler', () => {
  beforeEach(() => jest.resetModules())

  describe('the getApplication function', () => {
    it('gets an application from the cache', async () => {
      // Mock out the API calls
      const mockGetById = jest.fn(() => ({
        id: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de'
      }))

      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: mockGetById
          }
        }
      }))

      // Mock out the cache
      const mockGetData = jest.fn(() => ({
        userId: uuidv4(),
        applicationId: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de'
      }))

      const request = {
        cache: () => ({
          getData: mockGetData
        })
      }

      const { getApplication } = await import('../tasklist.js')
      const result = await getApplication(request)
      expect(result).toEqual({ id: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de' })
    })

    it('gets an application from the parameter', async () => {
      // Mock out the API calls
      const mockGetById = jest.fn(() => ({
        id: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de'
      }))

      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: mockGetById
          }
        }
      }))

      // Mock out the cache
      const mockGetData = jest.fn(() => ({
        userId: '7fbfccf8-0a05-4c7a-9f53-53bed7f0a315'
      }))

      const mockSetData = jest.fn()

      const request = {
        query: { applicationId: '9acaf22c-b5c2-4109-9ad0-0d798dc477a7' },
        cache: () => ({
          getData: mockGetData,
          setData: mockSetData
        })
      }

      const { getApplication } = await import('../tasklist.js')
      const result = await getApplication(request)
      expect(mockSetData).toHaveBeenCalledWith({ applicationId: '9acaf22c-b5c2-4109-9ad0-0d798dc477a7', userId: '7fbfccf8-0a05-4c7a-9f53-53bed7f0a315' })
      expect(result).toEqual({ id: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de' })
    })

    it('gets an application from the parameter and with a change the the cached id', async () => {
      // Mock out the API calls
      const mockGetById = jest.fn(() => ({
        id: '9acaf22c-b5c2-4109-9ad0-0d798dc477a7'
      }))

      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: mockGetById
          }
        }
      }))

      // Mock out the cache
      const mockGetData = jest.fn(() => ({
        userId: 'f5d6961c-faa7-40ec-a04a-d4772c952e38',
        applicationId: uuidv4()
      }))

      const mockSetData = jest.fn()

      const request = {
        query: { applicationId: '9acaf22c-b5c2-4109-9ad0-0d798dc477a7' },
        cache: () => ({
          getData: mockGetData,
          setData: mockSetData
        })
      }

      const { getApplication } = await import('../tasklist.js')
      const result = await getApplication(request)
      expect(mockSetData).toHaveBeenCalledWith({ applicationId: '9acaf22c-b5c2-4109-9ad0-0d798dc477a7', userId: 'f5d6961c-faa7-40ec-a04a-d4772c952e38' })
      expect(result).toEqual({ id: '9acaf22c-b5c2-4109-9ad0-0d798dc477a7' })
    })

    it('creates an application from the parameter the database if id is not set in the cache', async () => {
      // Mock out the API calls
      const mockGetById = jest.fn(() => ({
        id: '9acaf22c-b5c2-4109-9ad0-0d798dc477a7'
      }))

      const mockCreate = jest.fn(() => ({ id: '9acaf22c-b5c2-4109-9ad0-0d798dc477a7' }))

      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: mockGetById,
            create: mockCreate
          }
        }
      }))

      // Mock out the cache
      const mockGetData = jest.fn(() => ({
        userId: 'f5d6961c-faa7-40ec-a04a-d4772c952e38'
      }))

      const mockSetData = jest.fn()

      const request = {
        cache: () => ({
          getData: mockGetData,
          setData: mockSetData
        })
      }

      const { getApplication } = await import('../tasklist.js')
      const result = await getApplication(request)
      expect(mockSetData).toHaveBeenCalledWith({ applicationId: '9acaf22c-b5c2-4109-9ad0-0d798dc477a7', userId: 'f5d6961c-faa7-40ec-a04a-d4772c952e38' })
      expect(mockCreate).toHaveBeenCalled()

      expect(result).toEqual({ id: '9acaf22c-b5c2-4109-9ad0-0d798dc477a7' })
    })

    it('throws if it cannot get an application', async () => {})
  })

  it('the getData works as expected where the eligibility check status is \'cannot start yet\'', async () => {
    const decoratedMap = [
      {
        name: 'check-before-you-start',
        tasks: [
          {
            name: 'eligibility-check',
            uri: '/eligibility-check',
            status: 'cannot-start-yet'
          }
        ]
      }]

    jest.doMock('../licence-type-map.js', () => {
      const actual = jest.requireActual('../licence-type-map.js')
      return {
        ...actual,
        getStatus: () => jest.fn(() => 'cannot-start'),
        updateStatusCache: jest.fn(),
        decorateMap: jest.fn(() => decoratedMap)
      }
    })

    // Mock out the API calls
    const mockGetById = jest.fn(() => ({
      applicationReferenceNumber: 'REFERENCE_NUMBER'
    }))

    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: mockGetById
        }
      }
    }))

    const { getData } = await import('../tasklist.js')

    // Mock out the cache
    const mockGetData = jest.fn(() => ({
      userId: uuidv4(),
      applicationId: uuidv4()
    }))

    const request = {
      cache: () => ({
        getData: mockGetData
      })
    }

    const result = await getData(request)
    expect(result).toEqual({
      reference: 'REFERENCE_NUMBER',
      licenceType: 'A24 Badger',
      licenceTypeMap: decoratedMap,
      progress: { completed: 0, from: 1 }
    })
  })

  it('the getData works as expected where a task status is set', async () => {
    const decoratedMap = [
      {
        name: 'check-before-you-start',
        tasks: [
          {
            name: 'eligibility-check',
            uri: '/eligibility-check',
            status: 'completed'
          }
        ]
      }]

    jest.doMock('../licence-type-map.js', () => {
      const actual = jest.requireActual('../licence-type-map.js')
      return {
        ...actual,
        getStatus: () => jest.fn(() => 'completed'),
        updateStatusCache: jest.fn(),
        decorateMap: jest.fn(() => decoratedMap)
      }
    })

    // Mock out the API calls
    const mockGetById = jest.fn(() => ({
      applicationReferenceNumber: 'REFERENCE_NUMBER'
    }))

    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        APPLICATION: {
          getById: mockGetById
        }
      }
    }))

    const { getData } = await import('../tasklist.js')

    // Mock out the cache
    const mockGetData = jest.fn(() => ({
      userId: uuidv4(),
      applicationId: uuidv4()
    }))

    const request = {
      cache: () => ({
        getData: mockGetData
      })
    }

    const result = await getData(request)
    expect(result).toEqual({
      licenceType: 'A24 Badger',
      licenceTypeMap: decoratedMap,
      reference: 'REFERENCE_NUMBER',
      progress: { completed: 1, from: 1 }
    })
  })
})

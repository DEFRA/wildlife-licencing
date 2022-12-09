describe('The task-list handler', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkData function', () => {
    it('returns null if not authenticated', async () => {
      const request = {
        auth: { isAuthenticated: false }
      }
      const { checkData } = await import('../tasklist.js')
      const result = await checkData(request)
      expect(result).toBeNull()
    })

    it('returns null if redirecting to an application', async () => {
      const request = {
        auth: { isAuthenticated: true },
        query: { applicationId: '123' }
      }
      const { checkData } = await import('../tasklist.js')
      const result = await checkData(request)
      expect(result).toBeNull()
    })

    it('returns null if an application is set in the journey', async () => {
      const request = {
        auth: { isAuthenticated: true },
        query: {},
        cache: () => ({
          getData: jest.fn(() => ({ applicationId: '123' }))
        })
      }
      const { checkData } = await import('../tasklist.js')
      const result = await checkData(request)
      expect(result).toBeNull()
    })

    it('returns a redirect to the applications page if no application is set in the journey and the user has an application', async () => {
      const request = {
        auth: { isAuthenticated: true },
        query: {},
        cache: () => ({
          getData: jest.fn(() => ({}))
        })
      }
      jest.doMock('../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            findByUser: jest.fn(() => [{ id: '123' }])
          }
        }
      }))
      const { checkData } = await import('../tasklist.js')
      const mockRedirect = jest.fn(() => '/applications')
      const result = await checkData(request, { redirect: () => mockRedirect })
      expect(result()).toEqual('/applications')
    })

    it('returns null if no application is set in the journey and the user has no applications', async () => {
      const request = {
        auth: { isAuthenticated: true },
        query: {},
        cache: () => ({
          getData: jest.fn(() => ({}))
        })
      }
      jest.doMock('../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            findByUser: jest.fn(() => [])
          }
        }
      }))
      const { checkData } = await import('../tasklist.js')
      const result = await checkData(request)
      expect(result).toBeNull()
    })
  })

  describe('the getApplication function', () => {
    it('gets an application from the cache', async () => {
      // Mock out the API calls
      const mockGetById = jest.fn(() => ({
        id: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de'
      }))

      jest.doMock('../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            getById: mockGetById
          }
        }
      }))

      // Mock out the cache
      const mockGetData = jest.fn(() => ({
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

    it('creates an application', async () => {
      // Mock out the API calls
      const mockCreate = jest.fn(() => ({
        id: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de'
      }))

      jest.doMock('../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            create: mockCreate
          }
        }
      }))

      // Mock out the cache
      const mockGetData = jest.fn(() => ({}))
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          getData: mockGetData,
          setData: mockSetData
        })
      }

      const { getApplication } = await import('../tasklist.js')
      const result = await getApplication(request)
      expect(result).toEqual({ id: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de' })
      expect(mockSetData).toHaveBeenCalledWith({ applicationId: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de' })
    })

    it('gets an application from the query parameter without causing a switch of application', async () => {
      // Mock out the API calls
      const mockGetById = jest.fn(() => ({
        id: '9acaf22c-b5c2-4109-9ad0-0d798dc477a7'
      }))

      const mockFindRoles = jest.fn(() => ['USER'])

      jest.doMock('../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            getById: mockGetById,
            findRoles: mockFindRoles
          }
        }
      }))

      // Mock out the cache
      const mockGetData = jest.fn(() => ({
        userId: '7fbfccf8-0a05-4c7a-9f53-53bed7f0a315',
        applicationId: '9acaf22c-b5c2-4109-9ad0-0d798dc477a7',
        applicationUserId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
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
      expect(result).toEqual({ id: '9acaf22c-b5c2-4109-9ad0-0d798dc477a7' })
    })

    it('gets an application from the query parameter causing a switch of application', async () => {
      // Mock out the API calls
      const mockGetById = jest.fn(() => ({
        id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8'
      }))

      const mockFindRoles = jest.fn(() => ['USER'])
      jest.doMock('../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            getById: mockGetById,
            findRoles: mockFindRoles
          }
        }
      }))

      // Mock out the cache
      const mockGetData = jest.fn(() => ({
        userId: '7fbfccf8-0a05-4c7a-9f53-53bed7f0a315',
        applicationId: '9acaf22c-b5c2-4109-9ad0-0d798dc477a7',
        applicationUserId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
      }))

      const mockSetData = jest.fn()

      const request = {
        query: { applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' },
        cache: () => ({
          getData: mockGetData,
          setData: mockSetData
        })
      }

      const { getApplication } = await import('../tasklist.js')
      const result = await getApplication(request)
      expect(mockSetData).toHaveBeenCalledWith({
        applicationId: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8',
        userId: '7fbfccf8-0a05-4c7a-9f53-53bed7f0a315'
      })
      expect(result).toEqual({ id: '56ea844c-a2ba-4af8-9b2d-425a9e1c21c8' })
    })

    it('create an application user relationship', async () => {
      // Mock out the API calls
      const mockGetById = jest.fn(() => ({
        id: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de'
      }))

      const mockInitialize = jest.fn(() => ({
        application: { id: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de' },
        applicationUser: {
          id: '0d5509a8-48d8-4026-961f-a19918dfc28b',
          applicationId: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de',
          userId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        }
      }))

      jest.doMock('../../../services/api-requests.js', () => ({
        tagStatus: {
          NOT_STARTED: 'not-started'
        },
        APIRequests: {
          APPLICATION: {
            getById: mockGetById,
            initialize: mockInitialize
          }
        }
      }))

      // Mock out the cache
      const mockGetData = jest.fn(() => ({
        userId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
        applicationId: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de'
      }))

      const mockSetData = jest.fn()

      const request = {
        cache: () => ({
          setData: mockSetData,
          getData: mockGetData
        })
      }

      const { getApplication } = await import('../tasklist.js')
      const result = await getApplication(request)
      expect(mockInitialize).toHaveBeenCalledWith('2342fce0-3067-4ca5-ae7a-23cae648e45c', '8b2e3431-71f9-4c20-97f6-e5d192bfc0de', 'USER')
      expect(mockSetData).toHaveBeenCalledWith({
        applicationId: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de',
        applicationUserId: '0d5509a8-48d8-4026-961f-a19918dfc28b',
        role: 'USER',
        userId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
      })
      expect(result).toEqual({ id: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de' })
    })
  })

  it('the getData function returns the correct data to the template', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        COMPLETE: 'complete'
      },
      APIRequests: {
        APPLICATION: {
          getById: jest.fn(() => ({
            id: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de',
            applicationReferenceNumber: 'ref'
          }))
        }
      }
    }))

    const request = {
      cache: () => ({
        getData: jest.fn(() => ({
          applicationId: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de'
        }))
      })
    }

    jest.doMock('../licence-type-map.js', () => ({
      getTaskStatus: jest.fn(() => ({
        'eligibility-check': {
          tag: 'eligibility-check',
          tagState: 'complete'
        }
      })),
      decorateMap: jest.fn(() => 'decorated-map'),
      getProgress: jest.fn(() => 'progress'),
      licenceTypeMap: [],
      SECTION_TASKS: {
        ELIGIBILITY_CHECK: 'eligibility-check'
      },
      A24: 'a24'
    }))

    const { getData } = await import('../tasklist.js')
    const result = await getData(request)
    expect(result).toEqual({
      licenceType: 'a24',
      licenceTypeMap: 'decorated-map',
      progress: 'progress',
      reference: 'ref'
    })
  })

  describe('the tasklist backLink function', () => {
    it('returns no backlink if not authenticated', async () => {
      const request = {
        auth: { isAuthenticated: false }
      }
      const { tasklistBacklink } = await import('../tasklist.js')
      const result = await tasklistBacklink(request)
      expect(result).toBeFalsy()
    })

    it('returns no backlink if authenticated without applications', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            findByUser: jest.fn(() => [])
          }
        }
      }))
      const request = {
        auth: { isAuthenticated: true },
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de'
          }))
        })
      }
      const { tasklistBacklink } = await import('../tasklist.js')
      const result = await tasklistBacklink(request)
      expect(result).toBeFalsy()
    })

    it('returns the javascript backlink if authenticated with applications', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            findByUser: jest.fn(() => [{}, {}])
          }
        }
      }))
      const request = {
        auth: { isAuthenticated: true },
        cache: () => ({
          getData: jest.fn(() => ({
            userId: '8b2e3431-71f9-4c20-97f6-e5d192bfc0de'
          }))
        })
      }
      const { tasklistBacklink } = await import('../tasklist.js')
      const result = await tasklistBacklink(request)
      expect(result).toEqual('javascript: window.history.go(-1)')
    })
  })
})

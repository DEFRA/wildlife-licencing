describe('conditions-not-completed page', () => {
  beforeEach(() => jest.resetModules())

  it('getData', async () => {
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
          permissionData: {
            conditionsNotMetReason: 'conditionsNotMetReason'
          }
        })
      })
    }
    const { getData } = await import('../conditions-not-completed/conditions-not-completed.js')
    expect(await getData(request)).toStrictEqual({ conditionsNotMetReasonValue: 'conditionsNotMetReason' })
  })

  it('setData', async () => {
    const mockGetPermissionDetailsById = jest.fn()
    const mockUpdatePermissionsSection = jest.fn()
    const mockSetData = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        PERMISSION: {
          getPermissionDetailsById: mockGetPermissionDetailsById,
          updatePermissionsSection: mockUpdatePermissionsSection
        }
      }
    }))
    const request = {
      payload: {
        'conditions-not-met-reason': 'conditions-not-met-reason'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        }),
        setData: mockSetData
      })
    }
    const { setData } = await import('../conditions-not-completed/conditions-not-completed.js')
    await setData(request)
    expect(mockGetPermissionDetailsById).toHaveBeenCalled()
    expect(mockUpdatePermissionsSection).toHaveBeenCalled()
    expect(mockSetData).toHaveBeenCalled()
  })

  it('should redirect user to check your answers page', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started',
        COMPLETE: 'complete'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { get: () => 'complete' }
          }
        }
      }
    }))
    const request = {
      payload: {},
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { completion } = await import('../conditions-not-completed/conditions-not-completed.js')
    expect(await completion(request)).toBe('/check-your-answers')
  })

  it('should redirect user to potential conflicts page', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started',
        COMPLETE: 'complete'
      },
      APIRequests: {
        APPLICATION: {
          tags: () => {
            return { get: () => '' }
          }
        }
      }
    }))
    const request = {
      payload: {
        'conditions-not-met-reason': 'conditions-not-met-reason'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { completion } = await import('../conditions-not-completed/conditions-not-completed.js')
    expect(await completion(request)).toBe('/potential-conflicts')
  })
})

describe('conditions-reserved-matters page', () => {
  beforeEach(() => jest.resetModules())

  it('getData', async () => {
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
          permissionData: {
            potentialConflicts: 'potentialConflicts'
          }
        })
      })
    }
    const { getData } = await import('../conditions-reserved-matters/conditions-reserved-matters.js')
    expect(await getData(request)).toStrictEqual({ potentialConflictsValue: 'potentialConflicts' })
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
        'conditions-met': 'conditions-met'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        }),
        setData: mockSetData
      })
    }
    const { setData } = await import('../conditions-reserved-matters/conditions-reserved-matters.js')
    await setData(request)
    expect(mockGetPermissionDetailsById).toHaveBeenCalled()
    expect(mockUpdatePermissionsSection).toHaveBeenCalled()
    expect(mockSetData).toHaveBeenCalled()
  })

  it('should redirect user to potential conflicts page', async () => {
    const request = {
      payload: {
        'conditions-met': 'conditions-met'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { completion } = await import('../conditions-reserved-matters/conditions-reserved-matters.js')
    expect(await completion(request)).toBe('/potential-conflicts')
  })

  it('should redirect user to conditions not completed page', async () => {
    const request = {
      payload: {},
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { completion } = await import('../conditions-reserved-matters/conditions-reserved-matters.js')
    expect(await completion(request)).toBe('/conditions-not-completed')
  })
})

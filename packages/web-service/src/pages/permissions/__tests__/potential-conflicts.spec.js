describe('potential-conflicts page', () => {
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
    const { getData } = await import('../potential-conflicts/potential-conflicts.js')
    expect(await getData(request)).toStrictEqual({ potentialConflictsValue: 'potentialConflicts' })
  })

  it('setData', async () => {
    const mockUpdatePermissionsSection = jest.fn()
    const mockSet = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        PERMISSION: {
          getPermissionDetailsById: () => {
            return {
              noPermissionReason: 'noPermissionReason',
              noPermissionDescription: 'noPermissionDescription'
            }
          },
          updatePermissionsSection: mockUpdatePermissionsSection
        }
      }
    }))
    const request = {
      payload: {
        'potential-conflicts': true
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        }),
        setData: mockSet
      })
    }
    const { setData } = await import('../potential-conflicts/potential-conflicts.js')
    await setData(request)
    expect(mockUpdatePermissionsSection).toHaveBeenCalled()
    expect(mockSet).toHaveBeenCalled()
  })

  it('should redirect user to check your answers page', async () => {
    const request = {
      payload: {
        'potential-conflicts': false
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { completion } = await import('../potential-conflicts/potential-conflicts.js')
    expect(await completion(request)).toBe('/check-your-answers')
  })

  it('should redirect user to describe potential conflicts page', async () => {
    const request = {
      payload: {
        'potential-conflicts': true
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { completion } = await import('../potential-conflicts/potential-conflicts.js')
    expect(await completion(request)).toBe('/describe-potential-conflicts')
  })
})

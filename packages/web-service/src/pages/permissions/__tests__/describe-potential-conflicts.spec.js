describe('describe-potential-conflicts page', () => {
  beforeEach(() => jest.resetModules())

  it('getData', async () => {
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
          permissionData: {
            potentialConflictDescription: 'potentialConflictDescription'
          }
        })
      })
    }
    const { getData } = await import('../describe-potential-conflicts/describe-potential-conflicts.js')
    expect(await getData(request)).toStrictEqual({ potentialConflictDescriptionValue: 'potentialConflictDescription' })
  })

  it('setData', async () => {
    const mockUpdatePermissionsSection = jest.fn()
    const mockSet = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        PERMISSION: {
          getPermissionDetailsById: () => {
            return {
              planningType: 'planningType',
              planningTypeOtherDescription: 'planningTypeOtherDescription'
            }
          },
          updatePermissionsSection: mockUpdatePermissionsSection
        }
      }
    }))
    const request = {
      payload: {
        'describe-potential-conflicts': 'describe-potential-conflicts'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        }),
        setData: mockSet
      })
    }
    const { setData } = await import('../describe-potential-conflicts/describe-potential-conflicts.js')
    await setData(request)
    expect(mockUpdatePermissionsSection).toHaveBeenCalled()
    expect(mockSet).toHaveBeenCalled()
  })

  it('should redirect user to the check your answers page', async () => {
    const { completion } = await import('../describe-potential-conflicts/describe-potential-conflicts.js')
    expect(await completion()).toBe('/check-your-answers')
  })
})

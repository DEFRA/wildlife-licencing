describe('why-no-permission page', () => {
  beforeEach(() => jest.resetModules())

  it('throws an error if an option is not selected', async () => {
    try {
      const payload = { 'other-reason': 'yes' }
      const { validator } = await import('../why-no-permission/why-no-permission.js')
      expect(await validator(payload))
    } catch (e) {
      expect(e.details[0].message).toBe('"no-permission" is required')
    }
  })

  it('throws an error if an option is not selected', async () => {
    try {
      const payload = { 'no-permission': '452120002', 'other-reason': '' }
      const { validator } = await import('../why-no-permission/why-no-permission.js')
      expect(await validator(payload))
    } catch (e) {
      expect(e.details[0].message).toBe('"other-reason" is not allowed to be empty')
    }
  })

  it('should not throws an error if a permission is entered', async () => {
    const payload = { 'no-permission': 'no-permission', 'other-reason': 'yes' }
    const { validator } = await import('../why-no-permission/why-no-permission.js')
    expect(await validator(payload)).toBeUndefined()
  })

  it('should not throws an error if a permission option is entered', async () => {
    const payload = { 'no-permission': '452120002', 'other-reason': 'yes' }
    const { validator } = await import('../why-no-permission/why-no-permission.js')
    expect(await validator(payload)).toBeUndefined()
  })

  it('getData', async () => {
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        PERMISSION: {
          getPermissionDetailsById: () => {
            return {
              noPermissionReason: 'noPermissionReason',
              noPermissionDescription: 'noPermissionDescription'
            }
          }
        }
      }
    }))
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { getData } = await import('../why-no-permission/why-no-permission.js')
    expect(await getData(request)).toStrictEqual({
      HEALTH_AND_SAFETY: 452120001,
      OTHER: 452120002,
      PERMITTED_DEVELOPMENT: 452120000,
      noPermissionRequired: 'noPermissionReason',
      noPermissionRequiredReason: 'noPermissionDescription'
    })
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
    const request1 = {
      payload: {
        'no-permission': '452120002',
        'other-reason': 'other-reason'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        }),
        setData: mockSet
      })
    }
    const { setData } = await import('../why-no-permission/why-no-permission.js')
    await setData(request1)
    expect(mockUpdatePermissionsSection).toHaveBeenCalled()
    expect(mockSet).toHaveBeenCalled()

    const request2 = {
      payload: {
        'no-permission': '452120003'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        }),
        setData: mockSet
      })
    }
    await setData(request2)
    expect(mockUpdatePermissionsSection).toHaveBeenCalled()
    expect(mockSet).toHaveBeenCalled()
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
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { completion } = await import('../why-no-permission/why-no-permission.js')
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
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        })
      })
    }
    const { completion } = await import('../why-no-permission/why-no-permission.js')
    expect(await completion(request)).toBe('/potential-conflicts')
  })
})

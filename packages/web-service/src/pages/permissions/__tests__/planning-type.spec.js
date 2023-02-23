describe('planning-type page', () => {
  beforeEach(() => jest.resetModules())

  it('throws an error if an planning type is not selected', async () => {
    try {
      const payload = { 'other-description': 'yes' }
      const { validator } = await import('../planning-type/planning-type.js')
      expect(await validator(payload))
    } catch (e) {
      expect(e.details[0].message).toBe('"planning-type" is required')
    }
  })

  it('throws an error if planning type option is not selected', async () => {
    try {
      const payload = { 'planning-type': '452120003', 'other-description': '' }
      const { validator } = await import('../planning-type/planning-type.js')
      expect(await validator(payload))
    } catch (e) {
      expect(e.details[0].message).toBe('"other-description" is not allowed to be empty')
    }
  })

  it('should not throws an error if a permission planning type is entered', async () => {
    const payload = { 'planning-type': 'planning-type', 'other-description': 'yes' }
    const { validator } = await import('../planning-type/planning-type.js')
    expect(await validator(payload)).toBeUndefined()
  })

  it('should not throws an error if a permission planning type option is entered', async () => {
    const payload = { 'planning-type': '452120003', 'other-description': 'yes' }
    const { validator } = await import('../planning-type/planning-type.js')
    expect(await validator(payload)).toBeUndefined()
  })

  it('getData', async () => {
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c',
          permissionData: {
            otherDescription: 'otherDescription',
            planningTypeValue: 'planningTypeValue'
          }
        })
      })
    }
    const { getData } = await import('../planning-type/planning-type.js')
    expect(await getData(request)).toStrictEqual({
      FULL: 452120000,
      HYBRID: 452120002,
      OTHER: 452120003,
      OUTLINE: 452120001,
      otherDescription: undefined,
      planningTypeValue: undefined
    })
  })

  it('setData', async () => {
    const mockUpdatePermission = jest.fn()
    const mockSet = jest.fn()
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        PERMISSION: {
          getPermission: () => {
            return {
              planningType: 'planningType',
              planningTypeOtherDescription: 'planningTypeOtherDescription'
            }
          },
          updatePermission: mockUpdatePermission
        }
      }
    }))
    const request = {
      payload: {
        'planning-type': '452120003',
        'other-description': 'other-description'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c'
        }),
        setData: mockSet
      })
    }
    const { setData } = await import('../planning-type/planning-type.js')
    await setData(request)
    expect(mockUpdatePermission).toHaveBeenCalled()
    expect(mockSet).toHaveBeenCalled()
  })

  it('should redirect user to consent reference page', async () => {
    const { completion } = await import('../planning-type/planning-type.js')
    expect(await completion()).toBe('/consent-reference')
  })
})

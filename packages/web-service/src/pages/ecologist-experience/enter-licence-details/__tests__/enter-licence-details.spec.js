describe('The enter licence details page', () => {
  beforeEach(() => jest.resetModules())

  jest.doMock('../../../../session-cache/cache-decorator.js', () => {
    return {
      cacheDirect: () => {
        return {
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        }
      }
    }
  })

  it('should throw an error for an empty licence details', async () => {
    try {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getPreviousLicences: () => ['hello']
          }
        }
      }))
      const payload = { 'enter-licence-details': '' }
      const { validator } = await import('../enter-licence-details.js')
      expect(await validator(payload))
    } catch (e) {
      expect(e.message).toBe('ValidationError')
      expect(e.details[0].message).toBe('Error: You have not entered a licence number')
    }
  })

  it('should throw an error for an existing licence details', async () => {
    try {
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getPreviousLicences: () => ['licence1']
          }
        }
      }))
      const payload = { 'enter-licence-details': 'licence1' }
      const { validator } = await import('../enter-licence-details.js')
      expect(await validator(payload))
    } catch (e) {
      expect(e.message).toBe('ValidationError')
      expect(e.details[0].message).toBe('Error: You have already entered this badger mitigation licence')
    }
  })

  it('should not throw an error for a valid licence details', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        ECOLOGIST_EXPERIENCE: {
          getPreviousLicences: () => []
        }
      }
    }))
    const payload = { 'enter-licence-details': 'licence2' }
    const { validator } = await import('../enter-licence-details.js')
    expect(await validator(payload)).toBeUndefined()
  })

  it('sets the licence details in the api', async () => {
    const mockAdd = jest.fn()
    const mockPutExperienceById = jest.fn()
    jest.doMock('../../../../services/api-requests.js', () => ({
      APIRequests: {
        ECOLOGIST_EXPERIENCE: {
          addPreviousLicence: mockAdd,
          getExperienceById: () => ({ classMitigation: true }),
          putExperienceById: mockPutExperienceById
        }
      }
    }))
    const request = {
      payload: {
        'enter-licence-details': 'AB1234'
      },
      cache: () => ({
        getData: () => ({
          applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
        })
      })
    }
    const { setData } = await import('../enter-licence-details.js')
    await setData(request)
    expect(mockAdd).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', 'AB1234')
    expect(mockPutExperienceById).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', { classMitigation: true })
  })
})


describe('getData function', () => {
  beforeEach(() => jest.resetModules())

  it('returns the experience details from the api, if there have been no error on the input', async () => {
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
        })
      })
    }
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        ECOLOGIST_EXPERIENCE: {
          getExperienceById: jest.fn(() => ({ experienceDetails: 'experience' }))
        }
      }
    }))
    const { restoreInputGetData } = await import('../restore-input-get-data.js')
    expect(await restoreInputGetData(request, 'enter-experience')).toBe('experience')
  })

  it('returns the ecologists methods from the api, if there have been no error on the input', async () => {
    const request = {
      cache: () => ({
        getData: () => ({
          applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
        })
      })
    }
    jest.doMock('../../../services/api-requests.js', () => ({
      APIRequests: {
        ECOLOGIST_EXPERIENCE: {
          getExperienceById: jest.fn(() => ({ methodExperience: 'methods' }))
        }
      }
    }))
    const { restoreInputGetData } = await import('../restore-input-get-data.js')
    expect(await restoreInputGetData(request, 'enter-methods')).toBe('methods')
  })
})

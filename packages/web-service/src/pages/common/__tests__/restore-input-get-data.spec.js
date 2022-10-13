
describe('getData function', () => {
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
    expect(await restoreInputGetData(request)).toBe('experience')
  })

  it('returns the invalid input, if the user entered too much/too little', async () => {
    let journeyData = {
      applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
      tempInput: 'This is just test text to ensure its retrieved'
    }
    const request = {
      cache: () => ({
        getData: () => journeyData,
        setData: (newObj) => {
          journeyData = newObj
        }
      })
    }
    const { restoreInputGetData } = await import('../restore-input-get-data.js')
    const result = await restoreInputGetData(request)
    expect(result).toEqual('This is just test text to ensure its retrieved')
    // The tempInput prop should now be wiped
    expect(journeyData.tempInput).toEqual(undefined)
  })
})

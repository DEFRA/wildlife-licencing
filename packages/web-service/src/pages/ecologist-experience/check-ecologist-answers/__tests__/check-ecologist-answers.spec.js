describe('The check ecologist answers page', () => {
  beforeEach(() => jest.resetModules())

  describe('check data function', () => {
    it('calls the get experience end point if no experience data in cache and data is set correctly', async () => {
      const mockGet = jest.fn(() => ({
        previousLicense: true
      }))
      const mockSet = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: mockGet
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }),
          setData: mockSet
        })
      }
      const { checkData } = await import('../check-ecologist-answers.js')
      await checkData(request)
      expect(mockGet).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc')
      expect(mockSet).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        ecologistExperience: {
          previousLicense: true,
          complete: true
        }
      })
    })
    it('does not perform get if eco experience data already exists', async () => {
      const mockGet = jest.fn(() => ({
        previousLicense: true
      }))
      const mockSet = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            getExperienceById: mockGet
          }
        }
      }))
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
              previousLicense: true
            }
          }),
          setData: mockSet
        })
      }
      const { checkData } = await import('../check-ecologist-answers.js')
      await checkData(request)
      expect(mockGet).toHaveBeenCalledTimes(0)
      expect(mockSet).toHaveBeenCalledTimes(0)
    })
  })
  describe('get data function', () => {
    it('sets the display variables correctly and returns the ecologist experience data', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
              previousLicense: true,
              classMitigation: false
            }
          })
        })
      }
      const { getData } = await import('../check-ecologist-answers.js')
      expect(await getData(request)).toStrictEqual({
        previousLicense: true,
        classMitigation: false,
        classMitigationDisplay: 'No',
        previousLicenseDisplay: 'Yes'
      })
    })
    it('sets the display variables correctly if values alternate', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
              previousLicense: false,
              classMitigation: true
            }
          })
        })
      }
      const { getData } = await import('../check-ecologist-answers.js')
      expect(await getData(request)).toStrictEqual({
        previousLicense: false,
        classMitigation: true,
        classMitigationDisplay: 'Yes',
        previousLicenseDisplay: 'No'
      })
    })
  })
  describe('set data function', () => {
    it('deletes the ecologist data before returning to tasklist and sets the remaining data in cache', async () => {
      const mockSet = jest.fn()
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
              previousLicense: true,
              classMitigation: false
            }
          }),
          setData: mockSet
        })
      }
      const { setData } = await import('../check-ecologist-answers.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
      })
    })
  })
  describe('completion function', () => {
    it('returns the tasklist uri', async () => {
      const { completion } = await import('../check-ecologist-answers.js')
      expect(await completion()).toBe('/tasklist')
    })
  })
})

describe('The enter license details page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the license uri', async () => {
      const { completion } = await import('../enter-license-details.js')
      expect(await completion()).toBe('/license')
    })
  })
  describe('setData function', () => {
    it('sets new license details within array if they don\'t yet exist', async () => {
      const mockSet = jest.fn()
      const request = {
        cache: () => ({
          getPageData: () => ({
            payload: {
              'enter-license-details': 'AB1234'
            }
          }),
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {}
          }),
          setData: mockSet
        })
      }
      const { setData } = await import('../enter-license-details.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        ecologistExperience: {
          licenseDetails: ['AB1234']
        }
      })
    })
    it('adds new license details to existing array if already exists', async () => {
      const mockSet = jest.fn()
      const request = {
        cache: () => ({
          getPageData: () => ({
            payload: {
              'enter-license-details': 'ZA4321'
            }
          }),
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
            ecologistExperience: {
              licenseDetails: ['AB1234']
            }
          }),
          setData: mockSet
        })
      }
      const { setData } = await import('../enter-license-details.js')
      await setData(request)
      expect(mockSet).toHaveBeenCalledWith({
        applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc',
        ecologistExperience: {
          licenseDetails: ['AB1234', 'ZA4321']
        }
      })
    })
  })
})

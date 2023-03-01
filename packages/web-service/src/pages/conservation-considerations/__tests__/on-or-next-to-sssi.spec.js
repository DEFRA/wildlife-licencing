jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the On or next to SSSI functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the getData function', () => {
    it('returns the onOrNextToDesignatedSite flag', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: jest.fn(() => ({
              onOrNextToDesignatedSite: true
            })),
            tags: () => ({
              set: () => jest.fn()
            })
          }
        }
      }))

      const { getData } = await import('../on-or-next-to-sssi.js')
      const result = await getData(request)
      expect(result).toEqual({ yesNo: 'yes' })
    })
  })

  describe('the setData function', () => {
    it('stores the onOrNextToDesignatedSite flag', async () => {
      const mockUpdate = jest.fn()
      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          APPLICATION: {
            getById: jest.fn(() => ({
              foo: 'bar',
              onOrNextToDesignatedSite: false
            })),
            update: mockUpdate
          }
        }
      }))
      const request = {
        payload: { 'yes-no': 'yes' },
        cache: () => ({
          getData: () => ({
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          })
        })
      }

      const { setData } = await import('../on-or-next-to-sssi.js')
      await setData(request)
      expect(mockUpdate).toHaveBeenCalledWith('26a3e94f-2280-4ea5-ad72-920d53c110fc', { foo: 'bar', onOrNextToDesignatedSite: true })
    })
  })

  describe('the completion function', () => {
    it('redirects to the check answers page if answer is no', async () => {
      const { completion } = await import('../on-or-next-to-sssi.js')
      const request = {
        payload: { 'yes-no': 'no' }
      }
      const result = await completion(request)
      expect(result).toEqual('/sssi-check-answers')
    })

    it('redirects to the site-name page if answer is yes', async () => {
      const { completion } = await import('../on-or-next-to-sssi.js')
      const request = {
        payload: { 'yes-no': 'yes' }
      }
      const result = await completion(request)
      expect(result).toEqual('/sssi-site-name')
    })
  })
})

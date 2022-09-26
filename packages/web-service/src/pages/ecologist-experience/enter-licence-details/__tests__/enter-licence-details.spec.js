describe('The enter licence details page', () => {
  beforeEach(() => jest.resetModules())

  describe('completion function', () => {
    it('returns the licence uri', async () => {
      const { completion } = await import('../enter-licence-details.js')
      expect(await completion()).toBe('/licence')
    })
  })

  describe('setData function', () => {
    it('sets the licence details in the api', async () => {
      const mockAdd = jest.fn()
      jest.doMock('../../../../services/api-requests.js', () => ({
        APIRequests: {
          ECOLOGIST_EXPERIENCE: {
            addPreviousLicence: mockAdd
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
    })
  })
})

describe('The habitat entrances page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-entrances page', () => {
    it('the habitat-entrances page forwards onto habitat-active-entrances page', async () => {
      const { completion } = await import('../habitat-entrances.js')
      expect(await completion()).toBe('/habitat-active-entrances')
    })
    it('sets the entrance data correctly', async () => {
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          setData: mockSetData,
          getData: () => ({}),
          getPageData: () => ({
            payload: {
              'habitat-entrances': 99
            }
          })
        })
      }
      const { setData } = await import('../habitat-entrances.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        numberOfEntrances: 99
      })
    })
  })
})

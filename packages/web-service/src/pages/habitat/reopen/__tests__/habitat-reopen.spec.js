describe('The habitat reopen page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat reopen page', () => {
    it('the habitat reopen page forwards onto habitat-entrances page', async () => {
      const { completion } = await import('../habitat-reopen.js')
      expect(await completion()).toBe('/habitat-entrances')
    })
    it('sets the reopen data correctly', async () => {
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          setData: mockSetData,
          getData: () => ({}),
          getPageData: () => ({
            payload: {
              'habitat-reopen': true
            }
          })
        })
      }
      const { setData } = await import('../habitat-reopen.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        willReopen: true
      })
    })
  })
})

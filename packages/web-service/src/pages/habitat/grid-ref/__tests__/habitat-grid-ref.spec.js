describe('The habitat grid ref page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-grid-ref page', () => {
    it('the habitat-grid-ref page forwards onto habitat-work-start', async () => {
      const { completion } = await import('../habitat-grid-ref.js')
      expect(await completion()).toBe('/habitat-work-start')
    })
    it('sets the grid ref data correctly', async () => {
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          setData: mockSetData,
          getData: () => ({}),
          getPageData: () => ({
            payload: {
              'habitat-grid-ref': 'NY123456'
            }
          })
        })
      }
      const { setData } = await import('../habitat-grid-ref.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        gridReference: 'NY123456'
      })
    })
  })
})

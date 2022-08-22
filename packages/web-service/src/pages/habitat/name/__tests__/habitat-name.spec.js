describe('The habitat name page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-name page', () => {
    it('the habitat-name page forwards onto habitat-types page', async () => {
      const { completion } = await import('../habitat-name.js')
      expect(await completion()).toBe('/habitat-types')
    })
    it('sets the name correctly', async () => {
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          setData: mockSetData,
          getData: () => ({}),
          getPageData: () => ({
            payload: {
              'habitat-name': 'Badgerland'
            }
          })
        })
      }
      const { setData } = await import('../habitat-name.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        name: 'Badgerland'
      })
    })
  })
})

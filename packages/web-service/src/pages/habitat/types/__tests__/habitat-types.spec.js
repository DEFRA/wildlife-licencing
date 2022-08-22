describe('The habitat types page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat types page', () => {
    it('the habitat types page forwards onto habitat-reopen page', async () => {
      const { completion } = await import('../habitat-types.js')
      expect(await completion()).toBe('/habitat-reopen')
    })
    it('sets the entrance data correctly', async () => {
      const mockSetData = jest.fn()
      const request = {
        cache: () => ({
          setData: mockSetData,
          getData: () => ({
            habitatData: {}
          }),
          getPageData: () => ({
            payload: {
              'habitat-types': '100000011'
            }
          })
        })
      }
      const { setData } = await import('../habitat-types.js')
      await setData(request)
      expect(mockSetData).toHaveBeenCalledWith({
        habitatData:
          { settType: 100000011 }
      })
    })
  })
})

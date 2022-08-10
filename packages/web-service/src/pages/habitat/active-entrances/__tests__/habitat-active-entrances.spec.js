describe('The habitat active entrances page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-active-entrances page', () => {
    it('the habitat-active-entrances page forwards onto habitat-grid-ref page', async () => {
      const { completion } = await import('../habitat-active-entrances.js')
      expect(await completion()).toBe('/habitat-grid-ref')
    })
  })
})

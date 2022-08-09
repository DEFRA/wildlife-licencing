describe('The habitat grid ref page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-grid-ref page', () => {
    it('the habitat-grid-ref page forwards onto habitat-work-start', async () => {
      const { completion } = await import('../habitat-grid-ref.js')
      expect(await completion()).toBe('/habitat-work-start')
    })
  })
})

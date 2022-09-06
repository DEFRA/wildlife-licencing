describe('The habitat start page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat start page', () => {
    it('the habitat start page forwards onto habitat-name page', async () => {
      const { completion } = await import('../habitat-start.js')
      expect(await completion()).toBe('/habitat-name')
    })
  })
})

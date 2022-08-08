describe('The habitat-active page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat active page', () => {
    it('the habitat-active page forwards onto the habitat-reopen page', async () => {
      const { completion } = await import('../habitat-active.js')
      expect(await completion()).toBe('/habitat-reopen')
    })
  })
})

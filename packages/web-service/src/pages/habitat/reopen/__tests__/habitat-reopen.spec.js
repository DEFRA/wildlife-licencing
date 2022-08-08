describe('The habitat reopen page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat reopen page', () => {
    it('the habitat reopen page forwards onto habitat-entrances page', async () => {
      const { completion } = await import('../habitat-reopen.js')
      expect(await completion()).toBe('/habitat-entrances')
    })
  })
})

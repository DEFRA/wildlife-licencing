describe('The habitat types page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat types page', () => {
    it('the habitat types page forwards onto habitat-reopen page', async () => {
      const { completion } = await import('../habitat-types.js')
      expect(await completion()).toBe('/habitat-reopen')
    })
  })
})

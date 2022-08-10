describe('The habitat name page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-name page', () => {
    it('the habitat-name page forwards onto habitat-types page', async () => {
      const { completion } = await import('../habitat-name.js')
      expect(await completion()).toBe('/habitat-types')
    })
  })
})

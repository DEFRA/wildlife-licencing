describe('The habitat entrances page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-entrances page', () => {
    it('the habitat-entrances page forwards onto habitat-activities page', async () => {
      const { completion } = await import('../habitat-entrances.js')
      expect(await completion()).toBe('/habitat-activities')
    })
  })
})

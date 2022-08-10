describe('The habitat work end page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-work-end page', () => {
    it('the habitat-work-end page forwards onto habitat-activities', async () => {
      const { completion } = await import('../habitat-work-end.js')
      expect(await completion()).toBe('/habitat-activities')
    })
  })
})

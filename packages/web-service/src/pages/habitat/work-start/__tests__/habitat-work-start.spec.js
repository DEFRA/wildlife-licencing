describe('The habitat work start page', () => {
  beforeEach(() => jest.resetModules())

  describe('habitat-work-start page', () => {
    it('the habitat-work-start page forwards onto habitat-work-end', async () => {
      const { completion } = await import('../habitat-work-start.js')
      expect(await completion()).toBe('/habitat-work-end')
    })
  })
})

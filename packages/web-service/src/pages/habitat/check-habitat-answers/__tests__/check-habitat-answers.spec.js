describe('The check habitat answers page', () => {
  beforeEach(() => jest.resetModules())

  describe('check-habitat-answers page', () => {
    it('the check-habitat-answers page forwards onto the tasklist page', async () => {
      const { completion } = await import('../check-habitat-answers.js')
      expect(await completion()).toBe('/tasklist')
    })
  })
})

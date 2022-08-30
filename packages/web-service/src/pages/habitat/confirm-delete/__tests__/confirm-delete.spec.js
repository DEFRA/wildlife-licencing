describe('The confirm delte page', () => {
  beforeEach(() => jest.resetModules())

  describe('confirm delete page', () => {
    it('the confirm-delete page forwards onto check-habitat-answers', async () => {
      const { completion } = await import('../confirm-delete.js')
      expect(await completion()).toBe('/check-habitat-answers')
    })
  })
})

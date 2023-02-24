describe('add permissions start page', () => {
  beforeEach(() => jest.resetModules())

  it('completion', async () => {
    const { completion } = await import('../add-permission-start/add-permission-start.js')
    expect(await completion()).toBe('/consent-type')
  })
})

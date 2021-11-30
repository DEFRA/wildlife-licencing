
describe('The success handler', () => {
  it('logs a thrown error', async () => {
    jest.mock('@defra/wls-connectors-lib')
    const { DATABASE } = await import('@defra/wls-connectors-lib')
    DATABASE.getPool = jest.fn(() =>
      ({ connect: () => ({ release: jest.fn() }) })
    )
    const successHandler = (await import('../success-handler.js')).default

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(jest.fn())

    await successHandler(() => {
      throw new Error('foo')
    })

    expect(consoleSpy).toHaveBeenCalledWith('foo')
  })
})

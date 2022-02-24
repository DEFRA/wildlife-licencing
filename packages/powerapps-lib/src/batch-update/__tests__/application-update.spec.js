describe('The application update wrapper', () => {
  beforeEach(() => jest.resetModules())
  it('calls batch-update with the correct parameters', async () => {
    const mockBatchUpdate = jest.fn()
    jest.doMock('../batch-update.js', () => ({ batchUpdate: mockBatchUpdate }))
    const { applicationUpdate } = await import('../application-update.js')
    await applicationUpdate({ src: 'src' }, { keys: 'keys' })
    expect(mockBatchUpdate).toHaveBeenLastCalledWith(
      { src: 'src' }, { keys: 'keys' }, expect.any(Array))
  })
})

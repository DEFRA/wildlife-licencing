describe('The return update wrapper', () => {
  beforeEach(() => jest.resetModules())
  it('calls batch-update with the correct parameters', async () => {
    const mockBatchUpdate = jest.fn()
    jest.doMock('../batch-update.js', () => ({ batchUpdate: mockBatchUpdate }))
    const { returnUpdate } = await import('../return-update.js')
    await returnUpdate({ src: 'src' })
    expect(mockBatchUpdate).toHaveBeenLastCalledWith(
      { src: 'src' }, expect.any(Array))
  })
})

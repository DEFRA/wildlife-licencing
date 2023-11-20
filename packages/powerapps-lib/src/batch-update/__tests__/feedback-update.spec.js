describe('The feedback update wrapper', () => {
  beforeEach(() => jest.resetModules())
  it('calls batch-update with the correct parameters', async () => {
    const mockBatchUpdate = jest.fn()
    jest.doMock('../batch-update.js', () => ({ batchUpdate: mockBatchUpdate }))
    const { feedbackUpdate } = await import('../feedback-update.js')
    await feedbackUpdate({ src: 'src' })
    expect(mockBatchUpdate).toHaveBeenLastCalledWith(
      { src: 'src' }, expect.any(Array))
  })
})

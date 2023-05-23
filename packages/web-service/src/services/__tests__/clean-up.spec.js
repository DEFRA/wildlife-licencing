describe('the file cleanup process', () => {
  beforeEach(() => jest.resetModules())
  it('intervalFunc calls the clean up correctly', async () => {
    const currentDate = new Date()
    jest.doMock('util', () => ({
      promisify: jest.fn()
        .mockReturnValueOnce(() => ['file1.txt', 'file2.txt'])
        .mockReturnValueOnce(() => ({ isFile: () => true, mtime: currentDate.setDate(currentDate.getDate() - 3) }))
        .mockReturnValueOnce(jest.fn())
    }))
    const { intervalFunc } = await import('../clean-up.js')
    process.env.SCANDIR = '/tmp'
    expect(intervalFunc).not.toThrow()
  })
})

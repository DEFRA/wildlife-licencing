
describe('the initialization', () => {
  beforeEach(() => jest.resetModules())
  describe('the initializeScanDir function', () => {
    it('creates the scan directory if it does not exist', async () => {
      process.env.SCANDIR = '/scandir'
      const mockExistsSync = jest.fn().mockReturnValue(false)
      const mockMkdirSync = jest.fn()
      jest.doMock('../services/clean-up.js')
      jest.doMock('fs', () => ({
        existsSync: mockExistsSync,
        mkdirSync: mockMkdirSync,
        readdir: jest.fn(),
        stat: jest.fn(),
        unlink: jest.fn()
      }))
      const { initializeScanDir } = await import('../initialization.js')
      await initializeScanDir()
      expect(mockMkdirSync).toHaveBeenCalledWith('/scandir')
    })

    it('cleans the scan directory if it does exist', async () => {
      process.env.SCANDIR = '/scandir'
      const mockExistsSync = jest.fn().mockReturnValue(true)
      const mockCleanUpScanDir = jest.fn()
      jest.doMock('../services/clean-up.js', () => ({
        cleanUpScanDir: mockCleanUpScanDir
      }))
      jest.doMock('fs', () => ({
        existsSync: mockExistsSync,
        readdir: jest.fn(),
        stat: jest.fn(),
        unlink: jest.fn()
      }))
      const { initializeScanDir } = await import('../initialization.js')
      await initializeScanDir()
      expect(mockCleanUpScanDir).toHaveBeenCalled()
    })
  })
})

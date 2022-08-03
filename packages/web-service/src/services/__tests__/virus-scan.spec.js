
describe('The virus scanning service', () => {
  beforeEach(() => jest.resetModules())
  describe('The clam initialization', () => {
    it('resolves when initialized', async () => {
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => ({
        init: () => Promise.resolve({ initialized: true })
      })))
      const { initializeClamScan } = await import('../virus-scan.js')
      await expect(() => initializeClamScan()).resolves
    })
    it('rejects when initialization fails', async () => {
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => ({
        init: () => Promise.reject(new Error())
      })))
      const { initializeClamScan } = await import('../virus-scan.js')
      await expect(() => initializeClamScan()).rejects.toThrow()
    })
    it('rejects when uninitialized fails', async () => {
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => ({
        init: () => Promise.resolve({ initialized: false })
      })))
      const { initializeClamScan } = await import('../virus-scan.js')
      await expect(() => initializeClamScan()).rejects.toThrow()
    })
  })

  describe('Scan file request', () => {
    it('returns a true and unlinks when scanned infected file', async () => {
      const mockScan = { isInfected: true }
      const mockUnlinkSync = jest.fn()
      jest.doMock('fs', () => ({ unlinkSync: mockUnlinkSync }))
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => ({
        init: () => Promise.resolve({ isInfected: () => mockScan, initialized: true })
      })))
      const { scanFile, initializeClamScan } = await import('../virus-scan.js')
      await initializeClamScan()
      expect(await scanFile('text.txt')).toBe(true)
      await expect(mockUnlinkSync).toHaveBeenCalledWith('text.txt')
    })

    it('returns a false when scanned clean file', async () => {
      const mockScan = { isInfected: false }
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => ({
        init: () => Promise.resolve({ isInfected: () => mockScan, initialized: true })
      })))
      const { scanFile, initializeClamScan } = await import('../virus-scan.js')
      await initializeClamScan()
      expect(await scanFile('text.txt')).toBe(false)
    })

    it('throws error and deletes file when clamscan fails', async () => {
      const mockUnlinkSync = jest.fn()
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => ({
        init: () => Promise.resolve({ isInfected: () => { throw new Error() }, initialized: true })
      })))
      jest.doMock('fs', () => ({ unlinkSync: mockUnlinkSync }))
      const { scanFile, initializeClamScan } = await import('../virus-scan.js')
      await initializeClamScan()
      await expect(() => scanFile('text.txt')).rejects.toThrowError()
      await expect(mockUnlinkSync).toHaveBeenCalledWith('text.txt')
    })
  })
})


describe('The virus scanning service', () => {
  beforeEach(() => jest.resetModules())

  describe('Scan file request', () => {
    it('returns a boolean when initialised successfully', async () => {
      const mockScan = { isInfected: false }
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => ({
        init: () => Promise.resolve({ isInfected: () => mockScan })
      })))
      const { scanFile, initializeClamScan } = await import('../virus-scan.js')
      await initializeClamScan()
      expect(await scanFile('text.txt')).toBe(false)
    })

    it('throws error and deletes file when clamscan fails', async () => {
      const mockUnlinkSync = jest.fn()
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => ({
        init: () => Promise.resolve({ isInfected: () => { throw new Error() } })
      })))
      jest.doMock('fs', () => ({ unlinkSync: mockUnlinkSync }))
      const { scanFile, initializeClamScan } = await import('../virus-scan.js')
      await initializeClamScan()
      await expect(() => scanFile('text.txt')).rejects.toThrowError()
      await expect(mockUnlinkSync).toHaveBeenCalledTimes(1)
    })
  })
})

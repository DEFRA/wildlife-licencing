
describe('The virus scanning service', () => {
  beforeEach(() => jest.resetModules())

  describe('Scan file request', () => {
    it('throws an error if no filename provided', async () => {
      const { scanFile } = await import('../virus-scan.js')

      await expect(() => scanFile()).rejects.toThrow()
    })
    it('returns a boolean when initialised successfully', async () => {
      const mockScan = { isInfected: false }
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
        return ({ init: () => Promise.resolve({ isInfected: () => mockScan }) })
      })
      )
      const { scanFile } = await import('../virus-scan.js')
      expect(await scanFile('text.txt')).toBe(false)
    })
    it('throws error when clamscan fails', async () => {
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
        return ({ init: () => Promise.resolve({ isInfected: () => { throw new Error() } }) })
      })
      )
      const { scanFile } = await import('../virus-scan.js')
      await expect(() => scanFile('text.txt')).rejects.toThrowError()
    })
    it('throws an error if file could not be deleted', async () => {
      const mockScan = { isInfected: true }
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
        return ({ init: () => Promise.resolve({ isInfected: () => mockScan }) })
      })
      )
      const mockError = jest.fn((filename, callback) => callback(new Error('the file could not be deleted.')))
      jest.doMock('fs', () => ({ unlinkSync: mockError }))
      const logSpy = jest.spyOn(console, 'log')
      const { scanFile } = await import('../virus-scan.js')
      await expect(async () => await scanFile('text.txt')).rejects.toThrowError('the file could not be deleted.')
      await expect(logSpy).toHaveBeenCalledTimes(0)
    })
    it('deletes a file successfully', async () => {
      const mockScan = { isInfected: true }
      jest.doMock('clamscan', () => jest.fn().mockImplementation(() => {
        return ({ init: () => Promise.resolve({ isInfected: () => mockScan }) })
      })
      )
      const mockNull = jest.fn((filename, callback) => callback(null))
      jest.doMock('fs', () => ({ unlinkSync: mockNull }))
      const { scanFile } = await import('../virus-scan.js')
      let logSpy = jest.spyOn(console, 'log')
      await scanFile('text.txt')
      await expect(logSpy).toHaveBeenCalledWith('the file was deleted.')
    })
  })
})

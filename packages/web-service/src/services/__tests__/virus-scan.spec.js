
describe('The virus scanning service', () => {
  beforeEach(() => jest.resetModules())

  describe('Scan file request', () => {
    it('throws an error if no filename provided', async () => {
      const { scanFile } = await import('../virus-scan.js')
      await expect(() => scanFile()).toThrow()
    })
    it('returns isInfected bool when called', async () => {
      const mockScan = jest.fn(() => ({ isInfected: true }))
      const clamScan = await import('clamscan')
      const { NodeClam } = new clamScan.default()
      jest.doMock(NodeClam, async () => ({
        isInfected: async () => mockScan
      })
      )
      const { scanFile } = await import('../virus-scan.js')
      const fileScanner = await scanFile('file.txt')
      expect(fileScanner).toEqual({ isInfected: true })
    })
  })
})

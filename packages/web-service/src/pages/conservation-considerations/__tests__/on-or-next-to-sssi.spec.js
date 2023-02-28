jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the On or next to SSSI functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkData function', () => {
    it('smokes', async () => {
      const { checkData } = await import('../on-or-next-to-sssi.js')
    })
  })

  describe('the getData function', () => {
    it('smokes', async () => {
      const { getData } = await import('../on-or-next-to-sssi.js')
    })
  })

  describe('the setData function', () => {
    it('smokes', async () => {
      const { setData } = await import('../on-or-next-to-sssi.js')
    })
  })

  describe('the completion function', () => {
    it('smokes', async () => {
      const { completion } = await import('../on-or-next-to-sssi.js')
    })
  })
})

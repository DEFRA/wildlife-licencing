jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the special area on or close functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkData function', () => {
    it('smokes', async () => {
      const { checkData } = await import('../special-area-on-or-close.js')
    })
  })

  describe('the getData function', () => {
    it('smokes', async () => {
      const { getData } = await import('../special-area-on-or-close.js')
    })
  })

  describe('the setData function', () => {
    it('smokes', async () => {
      const { setData } = await import('../special-area-on-or-close.js')
    })
  })

  describe('the completion function', () => {
    it('smokes', async () => {
      const { completion } = await import('../special-area-on-or-close.js')
    })
  })
})
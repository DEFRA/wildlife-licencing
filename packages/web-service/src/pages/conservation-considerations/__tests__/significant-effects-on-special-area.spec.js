jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the significant effects on special area functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkData function', () => {
    it('smokes', async () => {
      const { checkData } = await import('../significant-effects-on-special-area.js')
    })
  })

  describe('the getData function', () => {
    it('smokes', async () => {
      const { getData } = await import('../significant-effects-on-special-area.js')
    })
  })

  describe('the setData function', () => {
    it('smokes', async () => {
      const { setData } = await import('../significant-effects-on-special-area.js')
    })
  })

  describe('the completion function', () => {
    it('smokes', async () => {
      const { completion } = await import('../significant-effects-on-special-area.js')
    })
  })
})

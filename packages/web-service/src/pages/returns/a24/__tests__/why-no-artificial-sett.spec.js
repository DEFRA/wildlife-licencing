jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the why no artificial sett functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkData function', () => {
    it('smokes', async () => {
      const { checkData } = await import('../why-no-artificial-sett.js')
    })
  })

  describe('the getData function', () => {
    it('smokes', async () => {
      const { getData } = await import('../why-no-artificial-sett.js')
    })
  })

  describe('the setData function', () => {
    it('smokes', async () => {
      const { setData } = await import('../why-no-artificial-sett.js')
    })
  })

  describe('the completion function', () => {
    it('smokes', async () => {
      const { completion } = await import('../why-no-artificial-sett.js')
    })
  })
})

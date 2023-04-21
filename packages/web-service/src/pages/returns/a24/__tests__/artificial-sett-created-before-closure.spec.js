jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the artificial sett created before closure functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkData function', () => {
    it('smokes', async () => {
      const { checkData } = await import('../artificial-sett-created-before-closure.js')
    })
  })

  describe('the getData function', () => {
    it('smokes', async () => {
      const { getData } = await import('../artificial-sett-created-before-closure.js')
    })
  })

  describe('the setData function', () => {
    it('smokes', async () => {
      const { setData } = await import('../artificial-sett-created-before-closure.js')
    })
  })

  describe('the completion function', () => {
    it('smokes', async () => {
      const { completion } = await import('../artificial-sett-created-before-closure.js')
    })
  })
})

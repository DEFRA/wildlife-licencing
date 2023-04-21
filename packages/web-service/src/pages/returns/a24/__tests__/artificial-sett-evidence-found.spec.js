jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the artificial sett evidence found functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkData function', () => {
    it('smokes', async () => {
      const { checkData } = await import('../artificial-sett-evidence-found.js')
    })
  })

  describe('the getData function', () => {
    it('smokes', async () => {
      const { getData } = await import('../artificial-sett-evidence-found.js')
    })
  })

  describe('the setData function', () => {
    it('smokes', async () => {
      const { setData } = await import('../artificial-sett-evidence-found.js')
    })
  })

  describe('the completion function', () => {
    it('smokes', async () => {
      const { completion } = await import('../artificial-sett-evidence-found.js')
    })
  })
})

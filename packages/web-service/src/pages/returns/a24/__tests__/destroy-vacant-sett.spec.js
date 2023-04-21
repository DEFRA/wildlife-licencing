jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the destroy vacant sett functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkData function', () => {
    it('smokes', async () => {
      const { checkData } = await import('../destroy-vacant-sett.js')
    })
  })

  describe('the getData function', () => {
    it('smokes', async () => {
      const { getData } = await import('../destroy-vacant-sett.js')
    })
  })

  describe('the setData function', () => {
    it('smokes', async () => {
      const { setData } = await import('../destroy-vacant-sett.js')
    })
  })

  describe('the completion function', () => {
    it('smokes', async () => {
      const { completion } = await import('../destroy-vacant-sett.js')
    })
  })
})

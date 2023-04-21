jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the destroy date functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkData function', () => {
    it('smokes', async () => {
      const { checkData } = await import('../destroy-date.js')
    })
  })

  describe('the getData function', () => {
    it('smokes', async () => {
      const { getData } = await import('../destroy-date.js')
    })
  })

  describe('the setData function', () => {
    it('smokes', async () => {
      const { setData } = await import('../destroy-date.js')
    })
  })

  describe('the completion function', () => {
    it('smokes', async () => {
      const { completion } = await import('../destroy-date.js')
    })
  })
})

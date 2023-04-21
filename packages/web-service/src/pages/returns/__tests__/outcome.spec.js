jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the Outcome functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkData function', () => {
    it('smokes', async () => {
      const { checkData } = await import('../outcome.js')
    })
  })

  describe('the getData function', () => {
    it('smokes', async () => {
      const { getData } = await import('../outcome.js')
    })
  })

  describe('the setData function', () => {
    it('smokes', async () => {
      const { setData } = await import('../outcome.js')
    })
  })

  describe('the completion function', () => {
    it('smokes', async () => {
      const { completion } = await import('../outcome.js')
    })
  })
})

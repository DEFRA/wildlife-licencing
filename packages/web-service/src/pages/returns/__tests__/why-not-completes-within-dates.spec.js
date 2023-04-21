jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the Why not Completes within dates functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkData function', () => {
    it('smokes', async () => {
      const { checkData } = await import('../a24/why-not-completes-within-dates.js')
    })
  })

  describe('the getData function', () => {
    it('smokes', async () => {
      const { getData } = await import('../a24/why-not-completes-within-dates.js')
    })
  })

  describe('the setData function', () => {
    it('smokes', async () => {
      const { setData } = await import('../a24/why-not-completes-within-dates.js')
    })
  })

  describe('the completion function', () => {
    it('smokes', async () => {
      const { completion } = await import('../a24/why-not-completes-within-dates.js')
    })
  })
})

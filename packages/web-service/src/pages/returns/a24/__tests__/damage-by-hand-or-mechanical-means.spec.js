jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the damage by hand or mechanical means functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkData function', () => {
    it('smokes', async () => {
      const { checkData } = await import('../damage-by-hand-or-mechanical-means.js')
    })
  })

  describe('the getData function', () => {
    it('smokes', async () => {
      const { getData } = await import('../damage-by-hand-or-mechanical-means.js')
    })
  })

  describe('the setData function', () => {
    it('smokes', async () => {
      const { setData } = await import('../damage-by-hand-or-mechanical-means.js')
    })
  })

  describe('the completion function', () => {
    it('smokes', async () => {
      const { completion } = await import('../damage-by-hand-or-mechanical-means.js')
    })
  })
})

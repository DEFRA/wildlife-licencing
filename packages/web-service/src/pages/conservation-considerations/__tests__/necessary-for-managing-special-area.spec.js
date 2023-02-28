jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the necessary for managing special area functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the checkData function', () => {
    it('smokes', async () => {
      const { checkData } = await import('../necessary-for-managing-special-area.js')
    })
  })

  describe('the getData function', () => {
    it('smokes', async () => {
      const { getData } = await import('../necessary-for-managing-special-area.js')
    })
  })

  describe('the setData function', () => {
    it('smokes', async () => {
      const { setData } = await import('../necessary-for-managing-special-area.js')
    })
  })

  describe('the completion function', () => {
    it('smokes', async () => {
      const { completion } = await import('../necessary-for-managing-special-area.js')
    })
  })
})

jest.spyOn(console, 'error').mockImplementation(() => null)
describe('The reset handler', () => {
  beforeEach(() => jest.resetModules())
  it('Returns a not found 200 response', async () => {
    const mockQuery = jest.fn()
    jest.doMock('@defra/wls-connectors-lib', () => ({
      SEQUELIZE: {
        getSequelize: () => ({
          query: mockQuery,
          QueryTypes: { DELETE: '' }
        })
      }
    }))
    const codeFunc = jest.fn()
    const typeFunc = jest.fn(() => ({ code: codeFunc }))
    const resFunc = jest.fn(() => ({ type: typeFunc }))
    const resetHandler = (await import('../reset.js')).default
    await resetHandler(null, null, {
      response: resFunc
    })
    expect(codeFunc).toBeCalledWith(200)
  })
  it('throws with error', async () => {
    const mockQuery = () => { throw new Error() }
    jest.doMock('@defra/wls-connectors-lib', () => ({
      SEQUELIZE: {
        getSequelize: () => ({
          query: mockQuery,
          QueryTypes: { DELETE: '' }
        })
      }
    }))
    const codeFunc = jest.fn()
    const resFunc = jest.fn(() => ({ code: codeFunc }))
    const resetHandler = (await import('../reset.js')).default
    await expect(() => resetHandler(null, null, { response: resFunc })).rejects.toThrowError()
  })
})

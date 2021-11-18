import validationFailHandler from '../validation-fail.js'

describe('The validationFailHandler handler', () => {
  it('Returns a bad request 400 response', async () => {
    const codeFunc = jest.fn()
    const resFunc = jest.fn(() => ({ code: codeFunc }))
    const result = await validationFailHandler(
      { validation: { errors: 'foo' } },
      null,
      {
        response: resFunc
      }
    )
    expect(resFunc).toBeCalledWith({ err: 'foo' })
    expect(codeFunc).toBeCalledWith(400)
    await expect(result).not.toBeNull()
  })
})

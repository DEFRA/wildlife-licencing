import notFoundHandler from '../not-found.js'

describe('The notFound handler', () => {
  it('Returns a not found 404 response', async () => {
    const codeFunc = jest.fn()
    const resFunc = jest.fn(() => ({ code: codeFunc }))
    const result = await notFoundHandler(null, null, {
      response: resFunc
    })
    expect(resFunc).toBeCalledWith({ err: 'not found' })
    expect(codeFunc).toBeCalledWith(404)
    await expect(result).not.toBeNull()
  })
})

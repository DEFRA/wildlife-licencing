import postResponseHandler from '../post-response-handler.js'

describe('The postResponseHandler handler', () => {
  it('Returns a server error 502 response on an invalid response', async () => {
    const codeFunc = jest.fn()
    const resFunc = jest.fn(() => ({ code: codeFunc }))
    const validateResponseFunc = jest.fn(() => ({ errors: 'baz' }))
    const result = await postResponseHandler(
      {
        response: 'foo',
        operation: 'bar',
        api: {
          validateResponse: validateResponseFunc
        }
      },
      null,
      {
        response: resFunc
      }
    )
    expect(validateResponseFunc).toBeCalledWith('foo', 'bar')
    expect(codeFunc).toBeCalledWith(502)
    await expect(result).not.toBeNull()
  })

  it('Returns a 200 on an valid response', async () => {
    const codeFunc = jest.fn()
    const resFunc = jest.fn(() => ({ code: codeFunc }))
    const validateResponseFunc = jest.fn(() => ({}))
    const result = await postResponseHandler(
      {
        response: 'foo',
        operation: 'bar',
        api: {
          validateResponse: validateResponseFunc
        }
      },
      null,
      {
        response: resFunc
      }
    )
    expect(validateResponseFunc).toBeCalledWith('foo', 'bar')
    expect(codeFunc).toBeCalledWith(200)
    await expect(result).not.toBeNull()
  })
})

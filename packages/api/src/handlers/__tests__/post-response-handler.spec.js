import postResponseHandler from '../post-response-handler.js'

jest.mock('@defra/wls-connectors-lib')

const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const resFunc = jest.fn(() => ({ type: typeFunc }))

describe('The postResponseHandler handler', () => {
  it('Ignore not found', async () => {
    const result = await postResponseHandler({ response: { source: 'foo', statusCode: 404 } })
    expect(result.statusCode).toEqual(404)
  })

  it('Ignore no content', async () => {
    const result = await postResponseHandler({ response: { source: 'foo', statusCode: 204 } })
    expect(result.statusCode).toEqual(204)
  })

  it('Returns a server error 502 response on an invalid response', async () => {
    const validateResponseFunc = jest.fn(() => ({ errors: ['baz'] }))
    const result = await postResponseHandler(
      {
        response: { source: 'foo', statusCode: 200 },
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
    expect(validateResponseFunc).toBeCalledWith('foo', 'bar', 200)
    expect(codeFunc).toBeCalledWith(500)
    await expect(result).not.toBeNull()
  })

  it('Returns a 200 valid response', async () => {
    const validateResponseFunc = jest.fn(() => ({}))
    const result = await postResponseHandler({
      response: { source: 'foo', statusCode: 200, header: jest.fn() },
      operation: 'bar',
      api: {
        validateResponse: validateResponseFunc
      }
    },
    { path: '/path' },
    { response: resFunc }
    )
    expect(validateResponseFunc).toBeCalledWith('foo', 'bar', 200)
    expect(codeFunc).toBeCalledWith(200)
    await expect(result).not.toBeNull()
  })

  it('Returns a 201 valid response', async () => {
    const validateResponseFunc = jest.fn(() => ({}))
    const result = await postResponseHandler({
      response: { source: 'foo', statusCode: 201, header: jest.fn() },
      operation: 'bar',
      api: {
        validateResponse: validateResponseFunc
      }
    },
    { path: '/path' },
    { response: resFunc }
    )
    expect(validateResponseFunc).toBeCalledWith('foo', 'bar', 201)
    expect(codeFunc).toBeCalledWith(201)
    await expect(result).not.toBeNull()
  })
})

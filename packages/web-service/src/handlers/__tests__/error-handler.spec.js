import { errorHandler } from '../error-handler.js'

describe('the error-page handler function', () => {
  it('it returns h.continue when not boom', async () => {
    const request = {
      response: {
        isBoom: false
      }
    }
    const h = { continue: 'continue' }
    const result = await errorHandler(request, h)
    expect(result).toEqual('continue')
  })

  it('it returns the client-error page with a error status 400', async () => {
    const request = {
      response: {
        isBoom: true,
        output: {
          statusCode: 400
        }
      }
    }
    const mockCode = jest.fn()
    const mockView = jest.fn(() => ({ code: mockCode }))
    const h = {
      continue: 'continue',
      view: mockView
    }
    await errorHandler(request, h)
    expect(mockView).toHaveBeenCalledWith('client-error', expect.any(Object))
    expect(mockCode).toHaveBeenCalledWith(400)
  })

  it('it returns the server-error page with a error status 500', async () => {
    const request = {
      url: '/page',
      path: 'path',
      query: 'query',
      params: 'params',
      payload: 'payload',
      headers: 'headers',
      state: 'state',
      method: 'method',
      response: {
        isBoom: true,
        output: {
          statusCode: 500
        }
      }
    }
    const mockCode = jest.fn()
    const mockView = jest.fn(() => ({ code: mockCode }))
    const h = {
      continue: 'continue',
      view: mockView
    }
    await errorHandler(request, h)
    expect(mockView).toHaveBeenCalledWith('server-error', expect.any(Object))
    expect(mockCode).toHaveBeenCalledWith(500)
  })
})

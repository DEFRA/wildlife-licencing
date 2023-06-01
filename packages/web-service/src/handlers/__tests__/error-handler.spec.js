import { errorHandler } from '../error-handler.js'

describe('the error-page handler function', () => {
  beforeEach(() => jest.resetModules())

  const mockCode = jest.fn()
  const mockView = jest.fn(() => ({ code: mockCode }))

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

  it('it returns the service-error page with a error status 200', async () => {
    const request = {
      response: {
        isBoom: true,
        output: {
          statusCode: 401
        }
      }
    }
    const h = {
      continue: 'continue',
      view: mockView
    }
    await errorHandler(request, h)
    expect(mockView).toHaveBeenCalledWith('service-error')
    expect(mockCode).toHaveBeenCalledWith(200)
  })

  it('it returns the service-error page with a error status 200', async () => {
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
    const h = {
      continue: 'continue',
      view: mockView
    }
    await errorHandler(request, h)
    expect(mockView).toHaveBeenCalledWith('service-error')
    expect(mockCode).toHaveBeenCalledWith(200)
  })

  it('it returns the not-found page with a error status 200', async () => {
    const request = {
      response: {
        isBoom: true,
        output: {
          statusCode: 404
        }
      }
    }
    const h = {
      continue: 'continue',
      view: mockView
    }
    await errorHandler(request, h)
    expect(mockCode).toHaveBeenCalledWith(200)
    expect(mockView).toHaveBeenCalledWith('not-found')
  })
})

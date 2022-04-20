import pageHandler from '../page-handler.js'
import Joi from 'joi'

describe('the page handler function', () => {
  it('the get handler invokes a given view with the page data', async () => {
    const getData = () => ({ foo: 'bar' })
    const mockView = jest.fn(() => 'view')
    const h = { view: mockView }
    const request = { cache: () => ({ getPageData: jest.fn(), setPageData: jest.fn() }) }
    const view = { view: 'view' }
    const result = await pageHandler(view, null, getData).get(request, h)
    expect(mockView).toHaveBeenLastCalledWith({ view: 'view' }, { data: { foo: 'bar' } })
    expect(result).toEqual('view')
  })

  it('the get handler calls the specified checkData function', async () => {
    const checkData = jest.fn(() => ({ foo: 'bar' }))
    const request = {}
    const h = {}
    const result = await pageHandler(null, checkData).get(request, h)
    expect(result).toEqual({ foo: 'bar' })
    expect(checkData).toHaveBeenCalledWith(request, h)
  })

  it('the post handler redirects to an explicit page', async () => {
    const mockRedirect = jest.fn(() => 'page')
    const h = { redirect: mockRedirect }
    const request = { cache: () => ({ getPageData: jest.fn(), setPageData: jest.fn() }) }
    const result = await pageHandler(null, null, null, 'next-page').post(request, h)
    expect(mockRedirect).toHaveBeenLastCalledWith('next-page')
    expect(result).toEqual('page')
  })

  it('the post handler calls a supplied setData function', async () => {
    const mockSetData = jest.fn()
    const h = { redirect: jest.fn() }
    const request = { cache: () => ({ getPageData: jest.fn(), setPageData: jest.fn() }) }
    await pageHandler(null, null, null, 'next-page', mockSetData).post(request, h)
    expect(mockSetData).toHaveBeenCalled()
  })

  it('the post handler redirects to the result of the completion function', async () => {
    const mockRedirect = jest.fn(() => 'page')
    const h = { redirect: mockRedirect }
    const request = { cache: () => ({ getPageData: jest.fn(), setPageData: jest.fn() }) }
    const result = await pageHandler(null, null, null, () => 'next-page').post(request, h)
    expect(mockRedirect).toHaveBeenLastCalledWith('next-page')
    expect(result).toEqual('page')
  })

  it('the error handler redirects to the same page', async () => {
    const err = new Joi.ValidationError('ValidationError',
      [{
        message: 'Unauthorized: email address not found',
        path: ['user-id'],
        type: 'unauthorized',
        context: {
          label: 'user-id',
          value: 'flintstone',
          key: 'user-id'
        }
      }])
    const mockSetPageData = jest.fn()
    const request = { path: '/page', payload: { foo: 'bar' }, cache: () => ({ setPageData: mockSetPageData }) }
    const mockRedirect = jest.fn(() => ({ takeover: jest.fn() }))
    const h = { redirect: mockRedirect }
    await pageHandler().error(request, h, err)
    expect(mockSetPageData).toHaveBeenCalledWith({ error: { 'user-id': 'unauthorized' }, payload: { foo: 'bar' } })
    expect(mockRedirect).toHaveBeenCalledWith('/page')
  })

  it('the error handler rethrows on an unexpected error', async () => {
    const err = new Error()
    const mockSetPageData = jest.fn()
    const request = { path: '/page', payload: { foo: 'bar' }, cache: () => ({ setPageData: mockSetPageData }) }
    const mockRedirect = jest.fn(() => ({ takeover: jest.fn() }))
    const h = { redirect: mockRedirect }
    await expect(() => pageHandler().error(request, h, err)).rejects.toThrowError()
  })
})

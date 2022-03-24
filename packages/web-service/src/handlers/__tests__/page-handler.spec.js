import pageHandler from '../page-handler.js'

describe('the page handler function', () => {
  it('the get handler invokes a given view with the page data', async () => {
    const getData = () => ({ foo: 'bar' })
    const mockView = jest.fn(() => 'view')
    const h = { view: mockView }
    const request = { cache: () => ({ getPageData: jest.fn(), setPageData: jest.fn() }) }
    const view = { view: 'view' }
    const result = await pageHandler(null, view, null, getData).get(request, h)
    expect(mockView).toHaveBeenLastCalledWith({ view: 'view' }, { data: { foo: 'bar' } })
    expect(result).toEqual('view')
  })

  it('the post handler redirects to an explicit page', async () => {
    const mockRedirect = jest.fn(() => 'page')
    const h = { redirect: mockRedirect }
    const request = { cache: () => ({ getPageData: jest.fn(), setPageData: jest.fn() }) }
    const result = await pageHandler(null, null, 'next-page', null).post(request, h)
    expect(mockRedirect).toHaveBeenLastCalledWith('next-page')
    expect(result).toEqual('page')
  })

  it('the post handler redirects to the result of the completion function', async () => {
    const mockRedirect = jest.fn(() => 'page')
    const h = { redirect: mockRedirect }
    const request = { cache: () => ({ getPageData: jest.fn(), setPageData: jest.fn() }) }
    const result = await pageHandler(null, null, () => 'next-page', null).post(request, h)
    expect(mockRedirect).toHaveBeenLastCalledWith('next-page')
    expect(result).toEqual('page')
  })
})

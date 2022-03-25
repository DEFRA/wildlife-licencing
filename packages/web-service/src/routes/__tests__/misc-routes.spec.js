import misc from '../misc-routes.js'

describe('The miscellaneous route handlers', () => {
  it('Unauthorized access redirects to the login handler', async () => {
    const route = misc.find(r => r.method === 'GET' && r.path === '/')
    const mockRedirect = jest.fn()
    const h = {
      redirect: mockRedirect
    }
    await route.handler(null, h)
    expect(mockRedirect).toHaveBeenCalledWith('/applications')
  })
})

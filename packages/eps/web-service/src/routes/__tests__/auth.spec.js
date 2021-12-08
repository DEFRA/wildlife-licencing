import routes from '../auth'

describe('.login', () => {
  const view = jest.fn()

  beforeEach(() => {
    routes.login.handler({}, { view })
  })
  it('has a GET method', () => {
    expect(routes.login.method).toEqual('GET')
  })
  it('has a handler which calls a view', () => {
    expect(view).toHaveBeenCalledWith('auth/login.njk')
  })
})

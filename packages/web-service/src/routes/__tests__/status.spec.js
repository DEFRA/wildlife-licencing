import routes from '../status'

describe('.serviceStatus', () => {
  const view = jest.fn()

  beforeEach(() => {
    routes.serviceStatus.handler({}, { view })
  })
  it('has a GET method', () => {
    expect(routes.serviceStatus.method).toEqual('GET')
  })
  it('has a handler which calls a view', () => {
    expect(view).toHaveBeenCalledWith('service-status.njk')
  })
})

describe('as a status', () => {
  let response

  beforeEach(() => {
    response = routes.status.handler({}, {})
  })
  it('has a GET method', () => {
    expect(routes.status.method).toEqual('GET')
  })
  it('has a handler which returns a JSON object', () => {
    expect(response).toBeInstanceOf(Object)
  })
})

import pageRoute from '../../../routes/page-route.js'

jest.mock('../../../routes/page-route.js')

describe('applications page', () => {
  it('should call the GET method', async () => {
    await import('../applications.js')
    expect(pageRoute).toBeCalledWith('applications', '/applications', null, '', expect.any(Function))
  })
})

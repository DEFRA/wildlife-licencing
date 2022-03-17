import pageRoute from '../../../routes/page-route.js'

jest.mock('../../../routes/page-route.js')

describe('login page', () => {
  it('should call the GET method', async () => {
    const { getData, postData } = await import('../login.js')
    expect(pageRoute).toBeCalledWith('login', '/login', null, postData, getData)
  })
})

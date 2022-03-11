import pageRoute from '../../../routes/page-route.js'

jest.mock('../../../routes/page-route.js')

describe('health page', () => {
  it('should call the GET method', async () => {
    const { getData } = await import('../health.js')
    expect(pageRoute).toBeCalledWith('health', '/health', null, '', getData)
  })
})

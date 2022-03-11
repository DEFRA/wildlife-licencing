import pageRoute from '../../../routes/page-route.js'

jest.mock('../../../routes/page-route.js')

describe('health page', () => {
  it('should fetch no data', async () => {
    const { getData } = await import('../health.js')
    const result = await getData({})
    expect(result).toEqual({})
  })

  it('should call the GET method', async () => {
    const { getData } = await import('../health.js')
    expect(pageRoute).toBeCalledWith('health', '/health', null, '', getData)
  })
})

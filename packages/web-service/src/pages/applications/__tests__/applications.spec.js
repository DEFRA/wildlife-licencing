import pageRoute from '../../../routes/page-route.js'

jest.mock('../../../routes/page-route.js')

describe('applications page', () => {
  it('should fetch the applications data', async () => {
    const response = [{ id: '579d4e05-e9d8-472f-a9a9-asdasdasdsad' }]
    const mockFetch = jest.fn(() => ({ ok: true, json: () => response }))
    jest.doMock('node-fetch', () => mockFetch)
    const { getData } = await import('../applications.js')
    const result = await getData({})
    expect(result.applications).toHaveLength(1)
    mockFetch.mockReset()
  })

  it('should be undefined if fetching applications data throws an exception', async () => {
    const mockFetch = jest.fn(() => {
      throw new Error('Random Exception')
    })
    jest.doMock('node-fetch', () => mockFetch)
    const { getData } = await import('../applications.js')
    const result = await getData({})
    expect(result.applications).toBeUndefined()
  })

  it('should call the GET method', async () => {
    const { getData } = await import('../applications.js')
    expect(pageRoute).toBeCalledWith('applications', '/applications', null, '', getData)
  })
})

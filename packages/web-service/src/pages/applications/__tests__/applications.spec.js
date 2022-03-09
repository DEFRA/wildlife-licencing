// import { getData } from '../applications.js'
import pageRoute from '../../../routes/page-route.js'
// import fetch from 'node-fetch'

const userId = '579d4e05-e9d8-472f-a9a9-3fc52234d88b'

jest.mock('../../../routes/page-route.js')


describe('applications page', () => {
  it('should get the applications data', async () => {
    const response = [{ id: '579d4e05-e9d8-472f-a9a9-asdasdasdsad' }]
    // const x = await fetch.mockImplementation(() => Promise.resolve(response))
    // const mockFetch = jest.fn(async () => Promise.resolve(response))
    const mockFetch = jest.fn(() => ({ ok: true, json: () => response }))
    jest.doMock('node-fetch', () => mockFetch)

    // getApplicationSitesByUserId = (await import('../get-application-sites-by-user-id.js')).default

    const { getData } = await import('../applications.js')
    // const fetch = await import('node-fetch')
    // const y = jest.isMockFunction(fetch)

    const result = await getData({})
    console.log(result)
    expect(result.applications).toHaveLength(1)
  })

  it('should call the GET method', async () => {
    const { getData } = await import('../applications.js')
    expect(pageRoute).toBeCalledWith('applications', '/applications', null, '', getData)
  })
})

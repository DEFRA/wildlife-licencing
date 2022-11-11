describe('site-name page handler', () => {
  beforeEach(() => jest.resetModules())
  it('setData', async () => {
    jest.doMock('../../../../services/api-requests.js', () => ({
      tagStatus: {
        NOT_STARTED: 'not-started'
      },
      APIRequests: {
        SITE: {
          create: jest.fn(() => ({ id: '6829ad54-bab7-4a78-8ca9-dcf722117a45' })),
          update: jest.fn(),
          findByApplicationId: jest.fn(),
          destroy: jest.fn()
        }
      }
    }))
    const { setData } = await import('../site-name.js')
    const request = {
      payload: {
        'site-name': 'name'
      },
      cache: () => ({
        getData: () => ({ applicationId: '2342fce0-3067-4ca5-ae7a-23cae648e45c' })
      })
    }
    await setData(request)
    // await expect(() => setData(request)).resolves
  })
})

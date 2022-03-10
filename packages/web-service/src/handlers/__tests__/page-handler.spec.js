import pageHandler from '../page-handler.js'

describe('the page handler function', () => {
  it('the get method throws any exceptions', async () => {
    const request = {}

    const getData = async () => {
      throw new Error('Random exception')
    }

    try {
      await pageHandler(null, null, null, getData).get(request)
    } catch (err) {
      expect(err.message).toBe('Random exception')
    }
  })
})

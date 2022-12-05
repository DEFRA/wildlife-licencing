
describe('The api-requests integration file', () => {
  beforeEach(() => jest.resetModules())

  it('The `apiRequestsWrapper` can rethrow the error generated from the base function', async () => {
    const { apiRequestsWrapper } = await import('../api-requests.js')
    try {
      await apiRequestsWrapper(
        () => { throw new Error('Welp. This didnt work') },
        'This is an example error log to help the developer',
        500
      )
    } catch (e) {
      expect(e.message).toBe('Welp. This didnt work')
    }
  })
})

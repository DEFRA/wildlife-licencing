jest.spyOn(console, 'error').mockImplementation(() => null)

const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

describe('The user update request handler', () => {
  beforeEach(() => jest.resetModules())
  it('Adds new organisation update requests to the queue', async () => {
    const mockAdd = jest.fn(() => ({ id: 1 }))
    jest.doMock('@defra/wls-queue-defs', () => ({
      getQueue: () => ({ add: mockAdd }),
      queueDefinitions: { USER_DETAILS_QUEUE: {} }
    }))
    const postUserUpdateSubmit = (await import('../user-update-submit.js')).default
    await postUserUpdateSubmit(null, { payload: { userId: '324b293c-a184-4cca-a2d7-2d1ac14e367e' } }, h)
    expect(mockAdd).toHaveBeenCalledWith({ userId: '324b293c-a184-4cca-a2d7-2d1ac14e367e' })
    expect(codeFunc).toHaveBeenCalledWith(204)
  })
  it('rethrows an error', async () => {
    jest.doMock('@defra/wls-queue-defs', () => ({
      getQueue: () => ({ add: () => { throw new Error() } }),
      queueDefinitions: { USER_DETAILS_QUEUE: {} }
    }))
    const postUserUpdateSubmit = (await import('../user-update-submit.js')).default
    await expect(async () => await postUserUpdateSubmit(null,
      { payload: { userId: '324b293c-a184-4cca-a2d7-2d1ac14e367e' } }, h)).rejects.toThrow()
  })
})

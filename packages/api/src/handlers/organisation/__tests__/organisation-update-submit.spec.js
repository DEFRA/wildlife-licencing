jest.spyOn(console, 'error').mockImplementation(() => null)

const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

describe('The organisation update request handler', () => {
  beforeEach(() => jest.resetModules())
  it('Adds new organisation update requests to the queue', async () => {
    const mockAdd = jest.fn(() => ({ id: 1 }))
    jest.doMock('@defra/wls-queue-defs', () => ({
      getQueue: () => ({ add: mockAdd }),
      queueDefinitions: { ORGANISATION_DETAILS_QUEUE: {} }
    }))
    const postOrganisationUpdateSubmit = (await import('../organisation-update-submit.js')).default
    await postOrganisationUpdateSubmit(null, { payload: { organisationId: '324b293c-a184-4cca-a2d7-2d1ac14e367e' } }, h)
    expect(mockAdd).toHaveBeenCalledWith({ organisationId: '324b293c-a184-4cca-a2d7-2d1ac14e367e' })
    expect(codeFunc).toHaveBeenCalledWith(204)
  })
  it('rethrows an error', async () => {
    jest.doMock('@defra/wls-queue-defs', () => ({
      getQueue: () => ({ add: () => { throw new Error() } }),
      queueDefinitions: { ORGANISATION_DETAILS_QUEUE: {} }
    }))
    const postOrganisationUpdateSubmit = (await import('../organisation-update-submit.js')).default
    await expect(async () => await postOrganisationUpdateSubmit(null,
      { payload: { organisationId: '324b293c-a184-4cca-a2d7-2d1ac14e367e' } }, h)).rejects.toThrow()
  })
})

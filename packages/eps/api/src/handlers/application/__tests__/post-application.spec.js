import { mockPersistence } from '../../../misc/test-utils.js'

const uuid = '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
const path = 'user/uuid'
const req = { path, payload: {} }

const queryData = {
  rows: [{
    id: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
    userId: 'caa74278-845f-4f4f-ab1f-021e6a3eed94',
    created: '2021-11-25T00:00:00.000Z',
    updated: '2021-11-25T00:00:00.000Z',
    sdds_id: null,
    submitted: false
  }]
}

const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const resFunc = jest.fn(() => ({ type: typeFunc }))

const context = { request: { params: { userId: uuid } } }

describe('The postUser handler', () => {
  it('returns a 201 on successful create', async () => {
    await mockPersistence.init()
    const postApplication = (await import('../post-application.js')).default
    mockPersistence.setMockQuery(() => (queryData))
    await postApplication(context, req, { response: resFunc })
    expect(mockPersistence.mocks.mockQuery).toHaveBeenCalledWith('INSERT INTO applications (id, user_id) values ($1, $2) RETURNING *',
      [expect.any(String), expect.any(String)])
    expect(codeFunc).toHaveBeenCalledWith(201)
  })
})

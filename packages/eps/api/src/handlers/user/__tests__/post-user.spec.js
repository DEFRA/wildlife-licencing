import { mockPersistence } from '../../../misc/test-utils.js'

const uuid = '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
const path = 'user/uuid'
const req = { path, payload: {} }

const queryData = {
  rows: [{
    id: '1e470963-e8bf-41f5-9b0b-52d19c21cb75',
    created: '2021-11-25T00:00:00.000Z',
    updated: '2021-11-25T00:00:00.000Z',
    sdds_id: null
  }]
}

const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const resFunc = jest.fn(() => ({ type: typeFunc }))

const context = { request: { params: { userId: uuid } } }

describe('The postUser handler', () => {
  it('returns a 201 on successful create', async () => {
    await mockPersistence.init()
    const postUser = (await import('../post-user')).default
    mockPersistence.setMockQuery(() => (queryData))
    await postUser(context, req, { response: resFunc })
    expect(mockPersistence.mocks.mockQuery).toHaveBeenCalledWith('INSERT INTO users (id) values ($1) RETURNING *', [expect.any(String)])
    expect(codeFunc).toHaveBeenCalledWith(201)
  })
})

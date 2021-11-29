import { mockPersistence } from '../../../misc/test-utils.js'

const uuid = '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
const path = 'user/uuid'
const req = { path, payload: {} }

const codeFunc = jest.fn()
const resFunc = jest.fn(() => ({ code: codeFunc }))

const context = { request: { params: { userId: uuid } } }

describe('The deleteUser handler', () => {
  it('returns a 204 on successful delete', async () => {
    await mockPersistence.init()
    const deleteUser = (await import('../delete-user')).default
    mockPersistence.setMockQuery(() => ({ rowCount: 1 }))
    await deleteUser(context, req, { response: resFunc })
    expect(mockPersistence.mocks.mockQuery).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', [uuid])
    expect(codeFunc).toHaveBeenCalledWith(204)
  })

  it('returns a 404 on id not found', async () => {
    await mockPersistence.init()
    const deleteUser = (await import('../delete-user')).default
    mockPersistence.setMockQuery(() => ({ rowCount: 0 }))
    await deleteUser(context, req, { response: resFunc })
    expect(mockPersistence.mocks.mockQuery).toHaveBeenCalledWith('DELETE FROM users WHERE id = $1', [uuid])
    expect(codeFunc).toHaveBeenCalledWith(404)
  })
})

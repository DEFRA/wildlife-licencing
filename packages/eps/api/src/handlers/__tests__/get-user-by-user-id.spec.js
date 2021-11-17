import getUserByUserId from '../get-user-by-user-id.js'

describe('The getUserByUserId handler', () => {
  it('returns the userId', async () => {
    const uuid = '1e470963-e8bf-41f5-9b0b-52d19c21cb75'
    const result = await getUserByUserId({
      request: {
        params: {
          userId: uuid
        }
      }
    })
    await expect(result).toEqual({ id: uuid })
  })
})

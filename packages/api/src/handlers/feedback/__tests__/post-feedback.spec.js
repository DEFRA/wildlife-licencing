jest.spyOn(console, 'error').mockImplementation(() => null)

// sdds_rating
// sdds_howcanweimprovethisservice

/*
 * Mock the hapi request object
 */
const path = '/feedback'
const req = {
  path,
  payload: {
    rating: 'Satisfied',
    howCanWeImproveThisService: 'Here is some text on how to improve the service'
  }
}

/*
 * Mock the hapi response toolkit in order to test the results of the request
 */
const codeFunc = jest.fn()
const typeFunc = jest.fn(() => ({ code: codeFunc }))
const h = { response: jest.fn(() => ({ type: typeFunc, code: codeFunc })) }

const ts = {
  createdAt: { toISOString: () => '2021-12-07T09:50:04.666Z' },
  updatedAt: { toISOString: () => '2021-12-07T09:50:04.666Z' }
}

const tsR = {
  createdAt: ts.createdAt.toISOString(),
  updatedAt: ts.updatedAt.toISOString()
}

/*
 * Create the parameters to mock the openApi context which is inserted into each handler
 */
const context = { request: { params: { licenceId: '1e470963-e8bf-41f5-9b0b-52d19c21cb77' } } }

const applicationJson = 'application/json'

describe('The postFeedback handler', () => {
  beforeEach(() => jest.resetModules())

  it('returns a 201 on successful create', async () => {
    const mockCreate = jest.fn(async () => ({ dataValues: { id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...ts } }))
    jest.doMock('@defra/wls-database-model', () => ({
      models: {
        feedbacks: {
          create: mockCreate
        }
      }
    }))

    const postFeedback = (await import('../post-feedback.js')).default

    await postFeedback(context, req, h)
    expect(mockCreate).toHaveBeenCalledWith({
      id: expect.any(String),
      feedbackData: {
        completedWithinLicenceDates: true
      }
    })
    expect(h.response).toHaveBeenCalledWith({ id: '1b239e85-6ddd-4e07-bb4f-3ebc7c76381f', ...tsR })
    expect(typeFunc).toHaveBeenCalledWith(applicationJson)
    expect(codeFunc).toHaveBeenCalledWith(201)
  })
})

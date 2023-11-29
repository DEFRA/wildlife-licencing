import { validator } from '../feedback.js'

describe('feedback.js', () => {
  beforeEach(() => jest.resetModules())
  describe('validator function', () => {
    it('should validate payload with nps-satisfaction', async () => {
      const payload = { 'nps-satisfaction': 'satisfied' }
      await expect(validator(payload)).resolves.not.toThrow()
    })

    it('should throw an error for missing nps-satisfaction', async () => {
      const payload = {}

      try {
        await validator(payload)
      } catch (error) {
        expect(error.isJoi).toBe(true)
        // Check if the error is about 'nps-satisfaction'
        expect(error.details[0].path[0]).toBe('nps-satisfaction')
      }
    })
  })

  describe('setData function', () => {
    it('should call createFeedback with expected parameters', async () => {
      const mockRequest = {
        payload: {
          'nps-satisfaction': 'satisfied',
          withHint: 'Some text'
        },
        auth: {
          credentials: { user: '12345' }
        }
      }

      const createFeedbackMock = jest.fn(() => ({}))

      jest.doMock('../../../services/api-requests.js', () => ({
        APIRequests: {
          FEEDBACK: {
            createFeedback: createFeedbackMock
          }
        }
      }))

      const { setData } = (await import('../feedback.js'))

      await setData(mockRequest)

      expect(createFeedbackMock).toHaveBeenCalledWith({
        userId: mockRequest.auth.credentials.user,
        rating: mockRequest.payload['nps-satisfaction'],
        howCanWeImproveThisService: mockRequest.payload.withHint
      })
    })
  })

  describe('getData function', () => {
    it('should hide the feedback banner', async () => {
      const mockRequest = {
        auth: {
          credentials: { user: '12345' }
        }
      }

      const { getData } = (await import('../feedback.js'))

      const data = await getData(mockRequest)

      expect(data).toEqual({
        hideFeedbackBanner: true
      })
    })
  })
})

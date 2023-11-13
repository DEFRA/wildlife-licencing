import { validator } from '../feedback.js'

describe('feedback.js', () => {
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
})

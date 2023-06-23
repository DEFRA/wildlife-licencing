jest.spyOn(console, 'error').mockImplementation(() => null)

describe('the returns upload functions', () => {
  beforeEach(() => jest.resetModules())

  describe('the completion function', () => {
    it('redirects to the returns check answers page if the answer is no', async () => {
      const { completion } = await import('../returns-upload.js')
      const request = {
        payload: { 'yes-no': 'no' }
      }
      const result = await completion(request)
      expect(result).toEqual('/returns-check')
    })

    it('redirects to the upload a return file page if the answer is yes', async () => {
      const { completion } = await import('../returns-upload.js')
      const request = {
        payload: { 'yes-no': 'yes' }
      }
      const result = await completion(request)
      expect(result).toEqual('/returns-upload-file')
    })
  })
})

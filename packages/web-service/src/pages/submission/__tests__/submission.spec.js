describe('submission spec', () => {
  beforeEach(() => jest.resetModules())

  describe('checkData', () => {
    it('the check data should return null if the all journeys are complete', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          })
        })
      }
      jest.doMock('../../common/count-complete-sections.js', () => ({
        countCompleteSections: () => { return [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }
      }))

      const { checkData } = await import('../submission.js')
      expect(await checkData(request)).toBeNull()
    })

    it('the check data should redirect if all the journeys aren\'t complete', async () => {
      const request = {
        cache: () => ({
          getData: () => ({
            applicationId: '35a6c59e-0faf-438b-b4d5-6967d8d075cb'
          })
        })
      }
      jest.doMock('../../common/count-complete-sections.js', () => ({
        countCompleteSections: () => { return [1] }
      }))
      const mockRedirect = jest.fn()
      const h = {
        redirect: mockRedirect
      }

      const { checkData } = await import('../submission.js')
      await checkData(request, h)
      expect(mockRedirect).toHaveBeenCalledTimes(1)
      expect(mockRedirect).toHaveBeenCalledWith('/tasklist')
    })
  })
})

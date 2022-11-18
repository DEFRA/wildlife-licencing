describe('add additional applicant', () => {
  beforeEach(() => jest.resetModules())

  describe('getData', () => {
    it('fetches the required data', async () => {
      jest.doMock('../../../common/tag-functions.js')
      jest.doMock('../../common/common.js', () => ({ canBeUser: () => true }))
      const request = {
        cache: () => ({
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      const { getData } = await import('../add-additional-applicant.js')
      const result = await getData(request)
      expect(result).toEqual({ isSignedInUserApplicant: false })
    })
  })

  describe('addAdditionalApplicantCompletion', () => {
    it('returns the ecologist-add page if the user answers no', async () => {
      const request = {
        cache: () => ({
          getPageData: () => ({ payload: { 'yes-no': 'no' } })
        })
      }
      const { addAdditionalApplicantCompletion } = await import('../add-additional-applicant.js')
      const result = await addAdditionalApplicantCompletion(request)
      expect(result).toEqual('/add-additional-ecologist')
    })

    it('returns the user page if the applicant is not the signed in user', async () => {
      jest.doMock('../../common/common.js', () => ({ canBeUser: () => true }))
      const request = {
        cache: () => ({
          getPageData: () => ({ payload: { 'yes-no': 'yes' } }),
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      const { addAdditionalApplicantCompletion } = await import('../add-additional-applicant.js')
      const result = await addAdditionalApplicantCompletion(request)
      expect(result).toEqual('/additional-applicant-user')
    })

    it('returns the name page if there are no candidate contacts', async () => {
      jest.doMock('../../common/common.js', () => ({
        canBeUser: () => false,
        getExistingContactCandidates: () => []
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({ payload: { 'yes-no': 'yes' } }),
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      const { addAdditionalApplicantCompletion } = await import('../add-additional-applicant.js')
      const result = await addAdditionalApplicantCompletion(request)
      expect(result).toEqual('/additional-applicant-name')
    })

    it('returns the names page if there are candidate contacts', async () => {
      jest.doMock('../../common/common.js', () => ({
        canBeUser: () => false,
        getExistingContactCandidates: () => [{}]
      }))
      const request = {
        cache: () => ({
          getPageData: () => ({ payload: { 'yes-no': 'yes' } }),
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          })
        })
      }
      const { addAdditionalApplicantCompletion } = await import('../add-additional-applicant.js')
      const result = await addAdditionalApplicantCompletion(request)
      expect(result).toEqual('/additional-applicant-names')
    })
  })
})

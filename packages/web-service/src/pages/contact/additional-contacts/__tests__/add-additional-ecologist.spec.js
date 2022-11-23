describe('add additional ecologist', () => {
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
      const { getData } = await import('../add-additional-ecologist.js')
      const result = await getData(request)
      expect(result).toEqual({ isSignedInUserEcologist: false })
    })
  })

  describe('addAdditionalEcologistCompletion', () => {
    it('returns the check page if the user answers no', async () => {
      const request = {
        cache: () => ({
          getPageData: () => ({ payload: { 'yes-no': 'no' } })
        })
      }
      const { addAdditionalEcologistCompletion } = await import('../add-additional-ecologist.js')
      const result = await addAdditionalEcologistCompletion(request)
      expect(result).toEqual('/additional-contact-check-answers')
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
      const { addAdditionalEcologistCompletion } = await import('../add-additional-ecologist.js')
      const result = await addAdditionalEcologistCompletion(request)
      expect(result).toEqual('/additional-ecologist-user')
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
      const { addAdditionalEcologistCompletion } = await import('../add-additional-ecologist.js')
      const result = await addAdditionalEcologistCompletion(request)
      expect(result).toEqual('/additional-ecologist-name')
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
      const { addAdditionalEcologistCompletion } = await import('../add-additional-ecologist.js')
      const result = await addAdditionalEcologistCompletion(request)
      expect(result).toEqual('/additional-ecologist-names')
    })
  })
})

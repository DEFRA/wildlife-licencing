describe('add additional contact check page', () => {
  beforeEach(() => jest.resetModules())

  describe('getData', () => {
    it('fetches the required data', async () => {
      jest.doMock('../../../common/tag-functions.js')
      jest.doMock('../../common/common.js', () => ({ canBeUser: () => true }))
      jest.doMock('../../../../services/api-requests.js', () => {
        const actual = jest.requireActual('../../../../services/api-requests.js')
        return {
          tagStatus: actual.tagStatus,
          APIRequests: {
            APPLICATION: {
              tags: () => ({ set: jest.fn() })
            },
            CONTACT: {
              role: () => ({
                getByApplicationId: jest.fn().mockReturnValueOnce({
                  fullName: 'Van Morrison',
                  userId: '35acb529-70bb-4b8d-8688-ccdec837e5d4',
                  contactDetails: { email: 'van.morrison@chieftons.ire' }
                })
                  .mockReturnValueOnce({
                    fullName: 'Robbie Robertson',
                    contactDetails: { email: 'robbie@theband.com' }
                  })
              })
            }
          }
        }
      })
      const request = {
        cache: () => ({
          getData: () => ({
            userId: '3a0fd3af-cd68-43ac-a0b4-123b79aaa83b',
            applicationId: '94de2969-91d4-48d6-a5fe-d828a244aa18'
          }),
          setData: jest.fn()
        })
      }
      const { getData } = await import('../additional-contact-check-answers.js')
      const result = await getData(request)
      expect(result).toEqual({
        applicant: [
          {
            key: 'addAdditionalApplicant',
            value: 'yes'
          },
          {
            key: 'applicantIsUser',
            value: 'yes'
          },
          {
            key: 'applicantName',
            value: 'Van Morrison'
          },
          {
            key: 'applicantEmail',
            value: 'van.morrison@chieftons.ire'
          }
        ],
        ecologist: [
          {
            key: 'addAdditionalEcologist',
            value: 'yes'
          },
          {
            key: 'ecologistIsUser',
            value: 'yes'
          },
          {
            key: 'ecologistName',
            value: 'Van Morrison'
          },
          {
            key: 'ecologistEmail',
            value: 'van.morrison@chieftons.ire'
          }
        ]
      })
    })
  })
})

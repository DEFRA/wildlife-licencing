describe('count complete sections', () => {
  beforeEach(() => jest.resetModules())

  describe('countCompleteSections', () => {
    it('can return 0 sections are complete', async () => {
      jest.doMock('../../../services/api-requests.js', () => ({
        tagStatus: {
          COMPLETE: 'complete'
        },
        APIRequests: {
          APPLICATION: {
            tags: () => {
              return {
                getAll: () => {
                  return [
                    { tag: 'setts', tagStatus: 'not-started' }
                  ]
                }
              }
            }
          }
        }
      }))

      const { countCompleteSections } = await import('../count-complete-sections.js')
      expect(await countCompleteSections('26a3e94f-2280-4ea5-ad72-920d53c110fc')).toEqual([])
    })
  })
})

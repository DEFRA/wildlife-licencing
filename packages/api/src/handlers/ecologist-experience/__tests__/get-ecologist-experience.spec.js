describe('The get ecologist experience endpoint', () => {
  beforeEach(() => jest.resetModules())

  describe('get ecologist experience', () => {
    it('returns a 404 if no experience is found', async () => {
      const mockCode = jest.fn()
      const context = {
        request: {
          params: {
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }
        }
      }
      const req = {}
      const h = {
        response: () => ({
          code: mockCode
        })
      }
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          ecologistExperience: {
            findOne: () => null
          }
        }
      }))
      const getEcologistExperience = (await import('../get-ecologist-experience.js')).default
      await getEcologistExperience(context, req, h)
      expect(mockCode).toHaveBeenCalledWith(404)
    })
    it('returns the correct object if experience is found', async () => {
      const mockCode = jest.fn()
      const mockType = jest.fn(() => ({ code: mockCode }))
      const mockResponse = jest.fn(() => ({ type: mockType }))
      const context = {
        request: {
          params: {
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }
        }
      }
      const req = {
        path: '/ecologist/26a3e94f-2280-4ea5-ad72-920d53c110fc/ecologist-experience'
      }
      jest.doMock('@defra/wls-connectors-lib', () => ({
        REDIS: {
          cache: {
            save: () => {}
          }
        }
      }))
      const h = {
        response: mockResponse
      }
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          ecologistExperience: {
            findOne: () => ({
              dataValues: {
                createdAt: new Date('11-05-22'),
                updatedAt: new Date('11-06-22'),
                experience: {
                  previousLicense: true
                },
                applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
              }
            })
          }
        }
      }))
      const getEcologistExperience = (await import('../get-ecologist-experience.js')).default
      await getEcologistExperience(context, req, h)
      expect(mockResponse).toHaveBeenCalledWith({
        previousLicense: true
      })
      expect(mockType).toHaveBeenCalledWith('application/json')
      expect(mockCode).toHaveBeenCalledWith(200)
    })
    it('throws an error if the experience data could not be retrieved', async () => {
      const context = {
        request: {
          params: {
            applicationId: '26a3e94f-2280-4ea5-ad72-920d53c110fc'
          }
        }
      }
      const req = {
        path: '/ecologist/26a3e94f-2280-4ea5-ad72-920d53c110fc/ecologist-experience'
      }
      jest.doMock('@defra/wls-connectors-lib', () => ({
        REDIS: {
          cache: {
            save: () => {}
          }
        }
      }))
      jest.doMock('@defra/wls-database-model', () => ({
        models: {
          ecologistExperience: {
            findOne: () => { throw new Error('Couldnt reach database') }
          }
        }
      }))
      const getEcologistExperience = (await import('../get-ecologist-experience.js')).default
      await expect(() => getEcologistExperience(context, req)).rejects.toThrowError('Couldnt reach database')
    })
  })
})

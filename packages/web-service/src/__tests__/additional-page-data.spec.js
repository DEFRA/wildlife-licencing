import { any } from 'joi'

describe('additional page data', () => {
  beforeEach(() => jest.resetModules())
  it('return response-toolkit continue', async () => {
    const mockHeaders = jest.fn()
    const request = {
      method: 'get',
      auth: {
        credentials: 'credentials'
      },
      response: {
        variety: 'view',
        source: {
          context: {}
        },
        header: mockHeaders
      }
    }

    const h = {
      continue: 'continue'
    }
    const { additionalPageData } = await import('../additional-page-data.js')
    const result = await additionalPageData(request, h)
    expect(result).toEqual('continue')
    expect(mockHeaders).toHaveBeenCalledWith('Content-Security-Policy', expect.stringContaining('script-src \'self\''))
    expect(request.response.source.context).toEqual({
      _uri: {
        applicantAddress: '/applicant-address',
        applicantEmail: '/applicant-email',
        applicantIsOrganisation: '/applicant-organisation',
        applicantName: '/applicant-name',
        applicantNames: '/applicant-names',
        applicantOrganisations: '/applicant-organisations',
        applicantPostcode: '/applicant-postcode',
        applicantUser: '/applicant-user',
        classMitigation: '/class-mitigation',
        classMitigationDetails: '/enter-class-mitigation-details',
        consent: '/consent',
        consentGranted: '/consent-granted',
        ecologistAddress: '/ecologist-address',
        ecologistEmail: '/ecologist-email',
        ecologistIsOrganisation: '/ecologist-organisation',
        ecologistName: '/ecologist-name',
        ecologistNames: '/ecologist-names',
        ecologistOrganisations: '/ecologist-organisations',
        ecologistPostcode: '/ecologist-postcode',
        ecologistUser: '/ecologist-user',
        experienceDetails: '/enter-experience',
        invoiceResponsible: '/invoice-responsible',
        invoiceAddress: '/invoice-address',
        invoiceEmail: '/invoice-email',
        invoiceIsOrganisation: '/invoice-organisation',
        invoiceName: '/invoice-name',
        invoiceNames: '/invoice-names',
        invoiceOrganisations: '/invoice-organisations',
        invoicePostcode: '/invoice-postcode',
        invoiceUser: '/invoice-user',
        landowner: '/landowner',
        landownerPermission: '/landowner-permission',
        licenceDetails: '/licence',
        login: '/login',
        methodExperience: '/enter-methods',
        previousLicence: '/previous-licence',
        register: '/register',
        siteGridReference: '/site-grid-ref',
        siteMap: '/upload-map',
        siteMapThree: '/upload-map-3',
        siteMapTwo: '/upload-map-2',
        siteName: '/site-name',
        signOut: '/sign-out'
      },
      credentials: 'credentials',
      cspNonce: expect.any(String)
    })
  })
})

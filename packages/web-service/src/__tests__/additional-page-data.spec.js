
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
        applicationSummary: '/application-summary',
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
        magic: {
          ramsar: 'https://magic.defra.gov.uk/MagicMap.aspx?&amp;startTopic=GreyRasters&amp;chosenLayers=ramPIndex,ramIndex,backdropDIndex,backdropIndex,europeIndex,baseIndex&amp;box=279318:63656:623806:237487&amp;useDefaultbackgroundMapping=false',
          sac: 'https://magic.defra.gov.uk/MagicMap.aspx?&amp;startTopic=GreyRasters&amp;chosenLayers=sacPIndex,sacIndex,backdropDIndex,backdropIndex,europeIndex,baseIndex&amp;box=-187428:14658:846037:536153&amp;useDefaultbackgroundMapping=false',
          spa: 'https://magic.defra.gov.uk/MagicMap.aspx?&amp;startTopic=GreyRasters&amp;chosenLayers=spaPIndex,spaIndex,backdropDIndex,backdropIndex,europeIndex,baseIndex&amp;box=-187428:14658:846037:536153&amp;useDefaultbackgroundMapping=false'
        },
        methodExperience: '/enter-methods',
        previousLicence: '/previous-licence',
        siteGridReference: '/site-grid-ref',
        siteMap: '/upload-map',
        siteMapThree: '/upload-map-of-mitigations-after-development',
        siteMapTwo: '/upload-map-of-mitigations-during-development',
        siteName: '/site-name',
        siteAddress: '/site-got-postcode',
        convictionDetails: '/conviction-details',
        isAnyConviction: '/any-convictions',
        signOut: '/sign-out',
        additionalApplicantAdd: '/add-additional-applicant',
        additionalApplicantEmail: '/additional-applicant-email',
        additionalApplicantNames: '/additional-applicant-names',
        additionalApplicantUser: '/additional-applicant-user',
        additionalEcologistAdd: '/add-additional-ecologist',
        additionalEcologistEmail: '/additional-ecologist-email',
        additionalEcologistNames: '/additional-ecologist-names',
        additionalEcologistUser: '/additional-ecologist-user',
        species: '/which-species',
        taskList: '/tasklist'
      },
      credentials: 'credentials',
      cspNonce: expect.any(String)
    })
  })
})

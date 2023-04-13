
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
        applications: '/applications',
        applicationLicence: '/application-licence',
        applicantUser: '/applicant-user',
        classMitigation: '/class-mitigation',
        classMitigationDetails: '/enter-class-mitigation-details',
        consent: '/consent',
        cookieInfo: '/cookie-info',
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
          ds: 'https://magic.defra.gov.uk/MagicMap.aspx?chosenLayers=sssiPIndex,sssiIndex,backdropDIndex,backdropIndex,europeIndex,vmlBWIndex,25kBWIndex,50kBWIndex,250kBWIndex,miniscaleBWIndex,baseIndex&box=-187122:5095:1034155:705095&useDefaultbackgroundMapping=false'
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
        onOrNextToDesignatedSite: '/on-or-next-to-designated-site',
        designatedSiteActivityAdvice: '/ne-activity-advice',
        designatedSiteNEAdvice: '/advice-from-natural-england',
        designatedSiteName: '/designated-site-name',
        designatedSiteOwnerPermission: '/designated-site-permission',
        designatedSitePermissionDetails: '/details-of-permission',
        designatedSiteProximity: '/designated-site-proximity',
        designatedSiteRemove: '/designated-site-remove',
        isAnyConviction: '/any-convictions',
        purchaseOrderReference: '/invoice-purchase-order',
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
        taskList: '/tasklist',
        workCategory: '/work-category',
        workPayment: '/work-payment',
        workPaymentExemptReason: '/work-payment-exempt-reason',
        workProposal: '/work-proposal'
      },
      credentials: 'credentials',
      cspNonce: expect.any(String)
    })
  })
})

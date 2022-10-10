export const ContactRoles = {
  APPLICANT: 'APPLICANT',
  ECOLOGIST: 'ECOLOGIST',
  PAYER: 'PAYER',
  AUTHORISED_PERSON: 'AUTHORISED-PERSON',
  ADDITIONAL_CONTACT: 'ADDITIONAL-CONTACT'
}
export const AccountRoles = {
  APPLICANT_ORGANISATION: 'APPLICANT-ORGANISATION',
  ECOLOGIST_ORGANISATION: 'ECOLOGIST-ORGANISATION',
  PAYER_ORGANISATION: 'PAYER-ORGANISATION'
}
export const contactRoleIsSingular = contactRole => [
  ContactRoles.APPLICANT,
  ContactRoles.ECOLOGIST,
  ContactRoles.PAYER
].includes(contactRole)
export const accountRoleIsSingular = accountRole => [
  AccountRoles.APPLICANT_ORGANISATION,
  AccountRoles.ECOLOGIST_ORGANISATION,
  AccountRoles.PAYER_ORGANISATION
].includes(accountRole)

export const addressLine1 = c => [
  c?.address?.subBuildingName,
  c?.address?.buildingName,
  c?.address?.buildingNumber,
  c?.address?.street,
  c?.address?.addressLine1
].filter(a => a).join(',<br>')

export const addressLine = c => [
  addressLine1(c),
  c?.address?.locality,
  c?.address?.dependentLocality,
  c?.address?.addressLine2,
  c?.address?.town,
  c?.address?.county,
  c?.address?.postcode
].filter(a => a).join(',<br>')

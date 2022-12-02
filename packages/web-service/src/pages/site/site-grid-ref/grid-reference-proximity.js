import { gridReferencePrefixes } from './prefix-easting-northing.js'

export const getGridReferenceProximity = (gridReference, xCor, yCor) => {
  // Look up for the prefix from the user 6 digit grid reference

  const gridReferencePrefix = gridReference?.substring(0, 2)
  const gridReferenceEasting = gridReference?.substring(2, 5) / 10
  const gridReferenceNorthing = gridReference?.substring(5) / 10

  const gridReferenceMatch = gridReferencePrefixes.find(row => row.prefix === gridReferencePrefix)

  const gridReferenceEastingMatch = gridReferenceEasting + gridReferenceMatch?.easting
  const gridReferenceNorthingMatch = gridReferenceNorthing + gridReferenceMatch?.northing
  // Work out the proximity between the two points

  const eastingDistance = (xCor / 1000) - gridReferenceEastingMatch
  const northingDistance = (yCor / 1000) - gridReferenceNorthingMatch

  return Math.sqrt((eastingDistance * eastingDistance) + (northingDistance * northingDistance))
}

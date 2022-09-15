import { Column } from '../schema.js'

export const address = [
  new Column('sdds_address1_subbuildingname', 'address.subBuildingName'),
  new Column('sdds_address1_buildingname', 'address.buildingName'),
  new Column('sdds_address1_buildingnumber', 'address.buildingNumber'),
  new Column('address1_line1', 'address.street'),
  new Column('address1_line2', 'address.locality'),
  new Column('address1_line3', 'address.dependentLocality'),
  new Column('address1_city', 'address.town'),
  new Column('address1_county', 'address.county'),
  new Column('address1_postalcode', 'address.postcode', s => s.toUpperCase()),
  new Column('address1_country', 'address.country'),
  // Add back in once Victor has changed to a numeric:
  //  new Column('sdds_address1_xcoordinate', 'address.xCoordinate'),
  //  new Column('sdds_address1_ycoordinate', 'address.yCoordinate'),
  new Column('sdds_address1_uprn', 'address.uprn')
]

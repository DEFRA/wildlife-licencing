import { Table, Column, OperationType } from '../schema.js'

export const SddsSite = new Table('sdds_sites', [
  new Column('sdds_name', 'name'),
  new Column('sdds_sourceremote', null, () => true, null, OperationType.INBOUND_AND_OUTBOUND, () => 'sdds_sourceremote eq true'),
  new Column('sdds_osgridreference', 'gridReference'),

  new Column('sdds_address1_subbuildingname', 'address.subBuildingName'),
  new Column('sdds_address1_buildingname', 'address.buildingName'),
  new Column('sdds_housenumber', 'address.buildingNumber'),

  new Column('sdds_addressline1', 'address.addressLine1'),
  new Column('sdds_addressline1', 'address.street'),
  new Column('sdds_addressline2', 'address.addressLine2'),
  new Column('sdds_addressline2', 'address.locality'),
  new Column('sdds_addressline3', 'address.addressLine3'),
  new Column('sdds_addressline3', 'address.dependentLocality'),
  new Column('sdds_town', 'address.town'),
  new Column('sdds_postcode', 'address.postcode', s => s.toUpperCase()),

  new Column('sdds_address1_xcoordinate', 'address.xCoordinate'),
  new Column('sdds_address1_ycoordinate', 'address.yCoordinate'),
  new Column('sdds_address1_uprn', 'address.uprn'),
  new Column('sdds_county', 'address.county'),

  new Column('sdds_address1_country', 'address.country')
], [], 'sites', 'sites', 'sdds_siteid')

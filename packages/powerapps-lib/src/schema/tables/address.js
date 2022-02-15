import { Column } from '../schema.js'

export const address = [new Column('address1_line1', 'address.addrline1'),
  new Column('address1_line2', 'address.addrline2'),
  new Column('address1_line3', 'address.addrline3'),
  new Column('address1_county', 'address.county'),
  new Column('address1_city', 'address.town'),
  new Column('address1_postalcode', 'address.postcode', s => s.toUpperCase())
]

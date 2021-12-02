import lodash from 'lodash'
import moment from 'moment'

const filters = {
 date: (value, format = 'D MMMM YYYY') => {
     if (lodash.isNil(value)) {
         return undefined;
     }
     const m = moment(value);
     return m.isValid() ? m.format(format) : undefined;
 }
}

export default filters

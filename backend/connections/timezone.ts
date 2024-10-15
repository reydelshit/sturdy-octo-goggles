import moment from 'moment-timezone';

moment.tz.setDefault('Asia/Manila');

export const getCurrentDateInManila = () => {
  return moment().toDate(); 
};

export default moment;
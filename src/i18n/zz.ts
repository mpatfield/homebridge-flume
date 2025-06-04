import merge from 'lodash.merge';

import en from './en.js';

const overrides = {

  config: {
    support: 'Zzzz zzz zzzz zz zzzzz zzzzzz zzzzz zzzz %s',

    description: {
      disableDeviceLogging: 'Zz zzzz zzzz zzz zzzzzzzz zzzzz zzzzzz zzzz zzz zzzzzz',
    },

    enumNames: {
      liters: 'Zzzzzz',
    },

    title: {
      clientSecret: 'Zzzzzz Zzzzz',
    },
  },
  
  customChar: {
    lastMonth: 'Zzzz Zzzzz',
  },

  general: {
    brand: 'Zzzzz',
    redacted: '****zzzzzzzz****',
  },

  startup: {
    complete: '✓ Zzzzz zzzzzzzz.',
  },

  status: {
    leakNotDetected: 'Zz zzzzz zzzzzzzz',
  },
};

const zz = merge({}, en, overrides);

export default zz;
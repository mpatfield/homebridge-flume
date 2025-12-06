const en = {

  config: {

    continue: 'Continue %s', // (arrow emoji) →
    needed: 'You will need your username, password, and Client ID/Secret from %s', // url
    support: 'For help and support please visit %s', // url
    thankYou: 'Thank you for installing Homebridge Flume',

    description: {
      clientSecret: 'Your Flume Client ID and Client Secret can be found at https://portal.flumetech.com',
      disableDeviceLogging: 'If true, then accessory status changes will not be logged',
      excludeDevices: 'Look for "Adding new device: [Device ID]" in the logs',
      refreshInterval: 'Number of minutes between requests to Flume for leak information',
      units: 'Volume units to use for custom characteristics',
      useNotifications: 'If true, an unread usage alert notification will be considered a leak',
      verbose: 'Enable additional debug logging',
    },

    enumNames: {
      gallons: 'Gallons',
      liters: 'Liters',
      cubicFeet: 'Cubic Feet',
      cubicMeters: 'Cubic Meters',
    },

    title: {
      clientId: 'Client ID',
      clientSecret: 'Client Secret',
      deviceId: 'Device ID',
      disableDeviceLogging: 'Disable Device Logging',
      excludeDevices: 'Exclude Devices',
      password: 'Flume Password',
      refreshInterval: 'Refresh Interval',
      units: 'Units',
      useNotifications: 'Use Unread Usage Notifications',
      username: 'Flume Username',
      verbose: 'Verbose',
    },
  },
  
  customChar: {
    lastMonth: 'Last Month',
    monthUsage: 'This Month',
    todayUsage: 'Today',
  },

  errors: {
    badConfig: 'One or more required variables are missing from the config. Please check the documentation.',
    httpRetry: 'Request failed. Retrying in %s minutes…', // number
    noDataReceived: 'No data received from http request',
    noDevices: 'No devices were found in your account',
    noRefreshToken: 'No refresh token has been retrieved. Performing full auth instead…',
  },

  general: {
    brand: 'Flume',
    redacted: '****redacted****',
  },

  startup: {
    complete: '✓ Setup complete.',
    newDevice: 'Adding new device:',
    removeDevice: 'Removing device:',
    restoringDevice: 'Restoring device:',
    welcome: [
      'Please ★ this plugin on GitHub if you\'re finding it useful! https://github.com/mpatfield/homebridge-flume',
      'Would you like to sponsor this plugin? https://github.com/sponsors/mpatfield',
      'Please rate us on HOOBS! https://plugins.hoobs.org/plugin/homebridge-flume',
      'Want to see this plugin in your own language? Please visit https://github.com/mpatfield/homebridge-flume/issues/107',
    ],
  },

  status: {
    batteryLow: 'Battery is low',
    batteryNormal: 'Battery is normal',
    connectionFault: 'No connection detected',
    connectionNormal: 'Connection restored',
    leakDetected: 'Leak detected!',
    leakNotDetected: 'No leaks detected',
  },
};

export default en;
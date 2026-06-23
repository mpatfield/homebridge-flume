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
      contactSensor: 'Contact',
      cubicFeet: 'Cubic Feet',
      cubicMeters: 'Cubic Meters',
      gallons: 'Gallons',
      leakSensor: 'Leak (Default)',
      liters: 'Liters',
      occupancySensor: 'Occupancy',
      motionSensor: 'Motion',
    },

    title: {
      clientId: 'Client ID',
      clientSecret: 'Client Secret',
      deviceId: 'Device ID',
      disableDeviceLogging: 'Disable Device Logging',
      excludeDevices: 'Exclude Devices',
      password: 'Flume Password',
      refreshInterval: 'Refresh Interval',
      sensorType: 'Sensor Type',
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